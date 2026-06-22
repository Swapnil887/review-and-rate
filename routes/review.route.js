const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { optionalAuth } = require('../middleware/auth.middleware');
const {
    createReview,
    getCompanyReviews,
    updateReview,
    deleteReview,
    likeReview,
    shareReview
} = require('../controller/review.controller');

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, createReview);
router.get('/', optionalAuth, getCompanyReviews);
router.put('/:reviewId', authMiddleware, updateReview);
router.delete('/:reviewId', authMiddleware, deleteReview);
router.post('/:reviewId/like', authMiddleware, likeReview);
router.post('/:reviewId/share', shareReview);

module.exports = router;
