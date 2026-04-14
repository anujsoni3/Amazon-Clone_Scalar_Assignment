const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_USER_ID = 1;
const SHIPPING_THRESHOLD = 499; // Free shipping above ₹499

/**
 * POST /api/orders
 * Body: { shippingAddress: { name, phone, addressLine1, addressLine2, city, state, pincode } }
 * Creates an order from the current cart, then clears the cart.
 */
const placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    // Validate shipping address
    const required = ['name', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingAddress?.[field]) {
        return res.status(400).json({
          success: false,
          error: `Shipping address field "${field}" is required`,
        });
      }
    }

    // Fetch current cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    // Check stock availability for all items
    for (const item of cartItems) {
      if (item.product.stockQty < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${item.product.name}"`,
        });
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);

    const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : 49;
    const total = subtotal + shippingCost;

    // Create order + order items + clear cart — all in one transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: DEFAULT_USER_ID,
          status: 'CONFIRMED',
          subtotal: parseFloat(subtotal.toFixed(2)),
          shippingCost: shippingCost,
          total: parseFloat(total.toFixed(2)),
          shippingAddress,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price, // price snapshot at time of order
            })),
          },
        },
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

      // 2. Decrease stock for each product
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });
      }

      // 3. Clear the cart
      await tx.cartItem.deleteMany({ where: { userId: DEFAULT_USER_ID } });

      return newOrder;
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
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

module.exports = { placeOrder, getOrderHistory, getOrderById };
