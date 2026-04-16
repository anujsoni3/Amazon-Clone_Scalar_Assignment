const prisma = require('../lib/prisma');
const { clearCacheByPrefix } = require('../lib/queryCache');
const { getIO } = require('../lib/socket');

const DEFAULT_USER_ID = 1;

const emitCartUpdated = () => {
  const io = getIO();
  if (!io) return;
  io.emit('cart:updated', { userId: DEFAULT_USER_ID, at: new Date().toISOString() });
};

/**
 * GET /api/cart
 * Returns all cart items for the default user with product + primary image
 */
const getCart = async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);

    res.json({
      success: true,
      data: cartItems,
      summary: {
        itemCount: cartItems.length,
        totalQty: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cart
 * Body: { productId, quantity }
 * If item already in cart, increments quantity. Otherwise creates a new cart item.
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const parsedProductId = parseInt(productId, 10);
    const parsedQty = parseInt(quantity, 10);

    if (!parsedProductId || Number.isNaN(parsedProductId)) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    if (!parsedQty || Number.isNaN(parsedQty) || parsedQty < 1) {
      return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
    }

    // Check product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: parsedProductId },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (product.stockQty < 1) {
      return res.status(400).json({ success: false, error: 'Product is out of stock' });
    }

    // Upsert: add new or increment existing
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId: DEFAULT_USER_ID, productId: parsedProductId },
      },
      update: {
        quantity: { increment: parsedQty },
      },
      create: {
        userId: DEFAULT_USER_ID,
        productId: parsedProductId,
        quantity: parsedQty,
      },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });

    clearCacheByPrefix('products:');
    emitCartUpdated();

    res.status(201).json({ success: true, data: cartItem });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cart/:itemId
 * Body: { quantity }
 * Updates the quantity of a cart item
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity, expectedQuantity } = req.body;
    const parsedItemId = parseInt(itemId, 10);
    const parsedQty = parseInt(quantity, 10);

    if (!parsedItemId || Number.isNaN(parsedItemId)) {
      return res.status(400).json({ success: false, error: 'Valid cart item id is required' });
    }

    if (!parsedQty || Number.isNaN(parsedQty) || parsedQty < 1) {
      return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: parsedItemId, userId: DEFAULT_USER_ID },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    const expectedQtyParsed = Number.isNaN(parseInt(expectedQuantity, 10))
      ? null
      : parseInt(expectedQuantity, 10);

    if (expectedQtyParsed !== null && cartItem.quantity !== expectedQtyParsed) {
      return res.status(409).json({ success: false, error: 'Cart item changed. Please refresh and retry.' });
    }

    const updateResult = await prisma.cartItem.updateMany({
      where: {
        id: parsedItemId,
        userId: DEFAULT_USER_ID,
        ...(expectedQtyParsed !== null ? { quantity: expectedQtyParsed } : {}),
      },
      data: { quantity: parsedQty },
    });

    if (updateResult.count === 0) {
      return res.status(409).json({ success: false, error: 'Cart item changed. Please refresh and retry.' });
    }

    const updated = await prisma.cartItem.findFirst({
      where: { id: parsedItemId, userId: DEFAULT_USER_ID },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });

    clearCacheByPrefix('products:');
    emitCartUpdated();

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cart/:itemId
 * Removes an item from the cart
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const parsedItemId = parseInt(itemId, 10);

    if (!parsedItemId || Number.isNaN(parsedItemId)) {
      return res.status(400).json({ success: false, error: 'Valid cart item id is required' });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: parsedItemId, userId: DEFAULT_USER_ID },
    });

    if (!cartItem) {
      // Treat delete as idempotent: if already gone, operation is still successful.
      return res.json({ success: true, message: 'Item already removed' });
    }

    await prisma.cartItem.delete({ where: { id: parsedItemId } });

    clearCacheByPrefix('products:');
    emitCartUpdated();

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
