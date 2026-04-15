const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_USER_ID = 1;

const getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { addedAt: 'desc' },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    res.json({ success: true, data: items });
  } catch (err) {
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
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
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
    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
