const prisma = require('../lib/prisma');
const { getCachedValue, setCachedValue } = require('../lib/queryCache');

/**
 * GET /api/products
 * Query params: q (search), category (slug), sort (price_asc|price_desc|rating|newest), page, limit
 */
const getProducts = async (req, res, next) => {
  try {
    const cacheKey = `products:list:${JSON.stringify(req.query || {})}`;
    const cached = getCachedValue(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const {
      q = '',
      category = '',
      sort = 'newest',
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      minRating,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    // Build orderBy clause
    const orderByMap = {
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      rating: { rating: 'desc' },
      newest: { createdAt: 'desc' },
    };
    const orderBy = orderByMap[sort] || { createdAt: 'desc' };

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
            take: 4,
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const payload = {
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };

    setCachedValue(cacheKey, payload, 15_000);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:id
 * Returns a single product with all images
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `products:detail:${id}`;
    const cached = getCachedValue(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { isPrimary: 'desc' } },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const payload = { success: true, data: product };
    setCachedValue(cacheKey, payload, 15_000);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById };
