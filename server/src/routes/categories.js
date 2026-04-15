const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
