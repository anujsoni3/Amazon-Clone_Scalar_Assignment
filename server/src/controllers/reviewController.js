const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_USER_ID = 1;

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

const canReviewProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const purchasedItem = await prisma.orderItem.findFirst({
      where: {
        productId: parseInt(productId),
        order: {
          userId: DEFAULT_USER_ID,
        },
      },
    });

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: DEFAULT_USER_ID,
          productId: parseInt(productId),
        },
      },
    });

    res.json({
      success: true,
      data: {
        eligible: !!purchasedItem,
        alreadyReviewed: !!existingReview,
      },
    });
  } catch (err) {
    next(err);
  }
};

const upsertReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'comment must be at least 10 characters' });
    }

    const purchasedItem = await prisma.orderItem.findFirst({
      where: {
        productId: parseInt(productId),
        order: {
          userId: DEFAULT_USER_ID,
        },
      },
    });

    if (!purchasedItem) {
      return res.status(403).json({
        success: false,
        error: 'You can only review products you have purchased',
      });
    }

    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: DEFAULT_USER_ID,
          productId: parseInt(productId),
        },
      },
      update: {
        rating: parseInt(rating),
        title: title?.trim() || null,
        comment: comment.trim(),
      },
      create: {
        userId: DEFAULT_USER_ID,
        productId: parseInt(productId),
        rating: parseInt(rating),
        title: title?.trim() || null,
        comment: comment.trim(),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    const aggregates = await prisma.review.aggregate({
      where: { productId: parseInt(productId) },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        rating: parseFloat((aggregates._avg.rating || 0).toFixed(1)),
        reviewCount: aggregates._count.rating,
      },
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProductReviews,
  canReviewProduct,
  upsertReview,
};
