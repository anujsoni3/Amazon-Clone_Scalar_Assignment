const prisma = require('../lib/prisma');
const { Prisma } = require('@prisma/client');

const DEFAULT_USER_ID = 1;
const SHIPPING_THRESHOLD = 499; // Free shipping above ₹499

const makeHttpError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const normalizeIdempotencyKey = (req) => {
  const headerKey = req.headers['x-idempotency-key'];
  const bodyKey = req.body?.idempotencyKey;
  const key = String(headerKey || bodyKey || '').trim();
  if (!key) return null;
  if (key.length > 120) {
    throw makeHttpError('Idempotency key is too long', 400);
  }
  return key;
};

const ORDER_ITEM_INCLUDE = {
  items: {
    include: {
      product: {
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  },
};

const findReplayOrder = async (idempotencyKey) => {
  if (!idempotencyKey) return null;
  return prisma.order.findFirst({
    where: {
      userId: DEFAULT_USER_ID,
      idempotencyKey,
    },
    include: ORDER_ITEM_INCLUDE,
  });
};

const validateShippingAddress = (shippingAddress, res) => {
  const required = ['name', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
  for (const field of required) {
    if (!shippingAddress?.[field]) {
      res.status(400).json({
        success: false,
        error: `Shipping address field "${field}" is required`,
      });
      return false;
    }
  }

  return true;
};

/**
 * POST /api/orders
 * Body: { shippingAddress: { name, phone, addressLine1, addressLine2, city, state, pincode } }
 * Creates an order from the current cart, then clears the cart.
 */
const placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;
    const idempotencyKey = normalizeIdempotencyKey(req);

    if (!validateShippingAddress(shippingAddress, res)) {
      return;
    }

    const replayOrder = await findReplayOrder(idempotencyKey);
    if (replayOrder) {
      return res.status(200).json({ success: true, data: replayOrder, idempotentReplay: true });
    }

    const order = await prisma.$transaction(async (tx) => {
      // Fetch current cart inside transaction for consistency.
      const cartItems = await tx.cartItem.findMany({
        where: { userId: DEFAULT_USER_ID },
        include: { product: true },
        orderBy: [{ productId: 'asc' }],
      });

      if (cartItems.length === 0) {
        throw makeHttpError('Cart is empty', 400);
      }

      const subtotal = cartItems.reduce((sum, item) => {
        return sum + parseFloat(item.product.price) * item.quantity;
      }, 0);

      const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : 49;
      const total = subtotal + shippingCost;

      // Atomically reserve/decrement stock per item to avoid overselling under concurrency.
      for (const item of cartItems) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            stockQty: { gte: item.quantity },
          },
          data: { stockQty: { decrement: item.quantity } },
        });

        if (updateResult.count === 0) {
          throw makeHttpError(`Insufficient stock for "${item.product.name}"`, 409);
        }
      }

      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: DEFAULT_USER_ID,
          idempotencyKey,
          status: 'CONFIRMED',
          subtotal: parseFloat(subtotal.toFixed(2)),
          shippingCost,
          total: parseFloat(total.toFixed(2)),
          shippingAddress,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
            })),
          },
        },
        include: ORDER_ITEM_INCLUDE,
      });

      // 3. Clear the cart
      await tx.cartItem.deleteMany({ where: { userId: DEFAULT_USER_ID } });

      return newOrder;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    if (err?.code === 'P2002') {
      try {
        const replayOrder = await findReplayOrder(normalizeIdempotencyKey(req));
        if (replayOrder) {
          return res.status(200).json({ success: true, data: replayOrder, idempotentReplay: true });
        }
      } catch {
        // fall through to global handler
      }
    }
    next(err);
  }
};

/**
 * POST /api/orders/buy-now
 * Body: { productId, quantity, shippingAddress }
 * Creates an order for a single item without consuming full cart.
 */
const placeBuyNowOrder = async (req, res, next) => {
  try {
    const { shippingAddress, productId, quantity = 1 } = req.body;
    const idempotencyKey = normalizeIdempotencyKey(req);

    if (!validateShippingAddress(shippingAddress, res)) {
      return;
    }

    const replayOrder = await findReplayOrder(idempotencyKey);
    if (replayOrder) {
      return res.status(200).json({ success: true, data: replayOrder, idempotentReplay: true });
    }

    const parsedProductId = parseInt(productId, 10);
    const parsedQtyRaw = parseInt(quantity, 10);
    const parsedQty = Number.isNaN(parsedQtyRaw) ? 1 : Math.max(1, parsedQtyRaw);

    if (!parsedProductId || Number.isNaN(parsedProductId)) {
      return res.status(400).json({ success: false, error: 'Valid productId is required' });
    }

    const order = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: parsedProductId },
      });

      if (!product) {
        throw makeHttpError('Product not found', 404);
      }

      const updateResult = await tx.product.updateMany({
        where: {
          id: parsedProductId,
          stockQty: { gte: parsedQty },
        },
        data: { stockQty: { decrement: parsedQty } },
      });

      if (updateResult.count === 0) {
        throw makeHttpError(`Insufficient stock for "${product.name}"`, 409);
      }

      const subtotal = parseFloat(product.price) * parsedQty;
      const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : 49;
      const total = subtotal + shippingCost;

      const newOrder = await tx.order.create({
        data: {
          userId: DEFAULT_USER_ID,
          idempotencyKey,
          status: 'CONFIRMED',
          subtotal: parseFloat(subtotal.toFixed(2)),
          shippingCost,
          total: parseFloat(total.toFixed(2)),
          shippingAddress,
          items: {
            create: [{
              productId: parsedProductId,
              quantity: parsedQty,
              unitPrice: product.price,
            }],
          },
        },
        include: ORDER_ITEM_INCLUDE,
      });

      return newOrder;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    if (err?.code === 'P2002') {
      try {
        const replayOrder = await findReplayOrder(normalizeIdempotencyKey(req));
        if (replayOrder) {
          return res.status(200).json({ success: true, data: replayOrder, idempotentReplay: true });
        }
      } catch {
        // fall through to global handler
      }
    }
    next(err);
  }
};

/**
 * GET /api/orders/history
 * Returns all orders for the default user, newest first
 */
const getOrderHistory = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { placedAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:orderId
 * Returns a single order by its UUID
 */
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, placeBuyNowOrder, getOrderHistory, getOrderById };
