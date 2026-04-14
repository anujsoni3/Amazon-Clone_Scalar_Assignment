const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_USER_ID = 1;

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

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    // Check product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
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
        userId_productId: { userId: DEFAULT_USER_ID, productId: parseInt(productId) },
      },
      update: {
        quantity: { increment: parseInt(quantity) },
      },
      create: {
        userId: DEFAULT_USER_ID,
        productId: parseInt(productId),
        quantity: parseInt(quantity),
      },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });

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
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: parseInt(itemId), userId: DEFAULT_USER_ID },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    const updated = await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity: parseInt(quantity) },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });

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

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: parseInt(itemId), userId: DEFAULT_USER_ID },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: parseInt(itemId) } });

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
