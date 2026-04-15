const express = require('express');
const {
  getProductReviews,
  canReviewProduct,
  upsertReview,
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.get('/eligibility/:productId', canReviewProduct);
router.post('/product/:productId', upsertReview);

module.exports = router;
