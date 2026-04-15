const prisma = require('../lib/prisma');

const DEFAULT_USER_ID = 1;

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, sort = 'recent', q = '', hasImage = '' } = req.query;

    const where = { productId: parseInt(productId) };

    if (rating && rating !== 'all') {
      where.rating = parseInt(rating);
    }

    if (q && String(q).trim()) {
      const query = String(q).trim();
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { comment: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (String(hasImage) === '1' || String(hasImage).toLowerCase() === 'true') {
      where.imageUrl = { not: null };
    }

    const orderByMap = {
      recent: [{ createdAt: 'desc' }],
      top: [{ rating: 'desc' }, { createdAt: 'desc' }],
      critical: [{ rating: 'asc' }, { createdAt: 'desc' }],
      helpful: [{ rating: 'desc' }, { createdAt: 'desc' }],
    };

    const reviews = await prisma.review.findMany({
      where,
      orderBy: orderByMap[sort] || orderByMap.recent,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    const reviewerIds = [...new Set(reviews.map((review) => review.userId))];
    let verifiedSet = new Set();

    if (reviewerIds.length > 0) {
      const verifiedOrders = await prisma.orderItem.findMany({
        where: {
          productId: parseInt(productId),
          order: {
            userId: { in: reviewerIds },
          },
        },
        include: {
          order: {
            select: { userId: true },
          },
        },
      });

      verifiedSet = new Set(verifiedOrders.map((item) => item.order.userId));
    }

    const reviewsWithFlags = reviews.map((review) => ({
      ...review,
      verified: verifiedSet.has(review.userId),
    }));

    res.json({ success: true, data: reviewsWithFlags });
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
    const { rating, title, comment, imageUrl } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'comment must be at least 10 characters' });
    }

    const sanitizedImageUrl = imageUrl?.trim() || null;

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
        imageUrl: sanitizedImageUrl,
      },
      create: {
        userId: DEFAULT_USER_ID,
        productId: parseInt(productId),
        rating: parseInt(rating),
        title: title?.trim() || null,
        comment: comment.trim(),
        imageUrl: sanitizedImageUrl,
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
