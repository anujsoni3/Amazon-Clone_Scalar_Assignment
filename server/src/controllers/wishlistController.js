const prisma = require('../lib/prisma');
const { clearCacheByPrefix } = require('../lib/queryCache');

const DEFAULT_USER_ID = 1;

const isDatabaseUnavailableError = (err) => {
  const message = String(err?.message || '');
  return message.includes("Can't reach database server") || message.includes('P1001') || message.includes('P1002');
};

const getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { addedAt: 'desc' },
      include: {
        product: {
          include: {
            images: { take: 3 },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    res.json({ success: true, data: items });
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return res.json({ success: true, data: [], fallback: true });
    }
    next(err);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const saved = await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: DEFAULT_USER_ID,
          productId: parseInt(productId),
        },
      },
      update: {},
      create: {
        userId: DEFAULT_USER_ID,
        productId: parseInt(productId),
      },
      include: {
        product: {
          include: {
            images: { take: 3 },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    clearCacheByPrefix('products:');

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return res.status(503).json({
        success: false,
        error: 'Wishlist is temporarily unavailable because the database connection could not be established.',
      });
    }
    next(err);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.wishlist.findFirst({
      where: { id: parseInt(itemId), userId: DEFAULT_USER_ID },
    });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Wishlist item not found' });
    }

    await prisma.wishlist.delete({ where: { id: parseInt(itemId) } });
    clearCacheByPrefix('products:');
    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return res.status(503).json({
        success: false,
        error: 'Wishlist is temporarily unavailable because the database connection could not be established.',
      });
    }
    next(err);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
