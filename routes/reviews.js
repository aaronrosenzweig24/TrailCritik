const express = require('express');
const router = express.Router({ mergeParams: true });

const Review = require('../models/review');
const Trail = require('../models/trails');
const catchAsync = require('../utils/catchAsync');
const { reviewSchema } = require('../schemas.js')
const ExpressError = require('../utils/ExpressError');


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}


router.post('/', validateReview, catchAsync(async(req, res) => {
    const trail = await Trail.findById(req.params.id);
    const review = new Review(req.body.review);
    trail.reviews.push(review);
    await review.save();
    await trail.save();
    req.flash('success', 'Created New Review')
    res.redirect(`/trails/${trail._id}`);
}))

router.delete('/:reviewId', catchAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Trail.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully Deleted Review')
    res.redirect(`/trails/${id}`);
}))

module.exports = router;