const Company = require('../models/company.model');
const Review = require('../models/review.model');

const getSortOption = (sortBy, order) => {
    const sortOrder = order === 'asc' ? 1 : -1;

    if (sortBy === 'rating') {
        return { rating: sortOrder, createdAt: -1 };
    }

    if (sortBy === 'relevance') {
        return { rating: -1, createdAt: -1 };
    }

    return { createdAt: sortOrder };
};

const getAverageRating = (reviews) => {
    if (!reviews.length) {
        return 0;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / reviews.length).toFixed(2));
};

const createReview = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { reviewerName, subject, reviewText, rating } = req.body;

        if (!reviewerName || !subject || !reviewText || rating === undefined) {
            return res.status(400).json({
                message: 'Reviewer name, subject, review text, and rating are required.'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found.' });
        }

        const review = await Review.create({
            userId: req.user.id,
            companyId,
            reviewerName,
            subject,
            reviewText,
            rating
        });

        res.status(201).json({
            message: 'Review posted successfully.',
            review
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create review.', error: err.message });
    }
};

const getCompanyReviews = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { sortBy = 'date', order = 'desc' } = req.query;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found.' });
        }

        const reviews = await Review.find({ companyId })
            .populate('userId', 'name email')
            .sort(getSortOption(sortBy, order));

        const reviewsWithInteractions = reviews.map((review) => ({
            ...review.toObject(),
            likesCount: review.likes.length,
            isLikedByUser: req.user
                ? review.likes.some((like) => like.toString() === req.user.id)
                : false
        }));

        res.status(200).json({
            message: 'Reviews fetched successfully.',
            averageRating: getAverageRating(reviews),
            count: reviewsWithInteractions.length,
            reviews: reviewsWithInteractions
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch reviews.', error: err.message });
    }
};

const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only edit your own review.' });
        }

        const { reviewerName, subject, reviewText, rating } = req.body;

        if (!reviewerName || !subject || !reviewText || rating === undefined) {
            return res.status(400).json({
                message: 'Reviewer name, subject, review text, and rating are required.'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        review.reviewerName = reviewerName;
        review.subject = subject;
        review.reviewText = reviewText;
        review.rating = rating;

        await review.save();

        res.status(200).json({
            message: 'Review updated successfully.',
            review
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update review.', error: err.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own review.' });
        }

        await review.deleteOne();

        res.status(200).json({ message: 'Review deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete review.', error: err.message });
    }
};

const likeReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        const alreadyLiked = review.likes.some(
            (like) => like.toString() === req.user.id
        );

        if (alreadyLiked) {
            review.likes = review.likes.filter(
                (like) => like.toString() !== req.user.id
            );
        } else {
            review.likes.push(req.user.id);
        }

        await review.save();

        res.status(200).json({
            message: alreadyLiked ? 'Review unliked successfully.' : 'Review liked successfully.',
            likesCount: review.likes.length,
            isLiked: !alreadyLiked
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update review like.', error: err.message });
    }
};

const shareReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        review.shares += 1;
        await review.save();

        res.status(200).json({
            message: 'Review shared successfully.',
            shares: review.shares
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to share review.', error: err.message });
    }
};

module.exports = {
    createReview,
    getCompanyReviews,
    updateReview,
    deleteReview,
    likeReview,
    shareReview
};
