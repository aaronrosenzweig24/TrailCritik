const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError')
const Trail = require('../models/trails');
const { trailSchema } = require('../schemas.js')

const validateTrail = (req, res, next) => {
    const { error } = trailSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next()
    }

}

router.get('/', catchAsync(async(req, res) => {
    const trails = await Trail.find({});
    res.render('trails/index', { trails })
}))
router.get('/new', (req, res) => {
    res.render('trails/new')
})
router.post('/', validateTrail, catchAsync(async(req, res) => {
    const trail = new Trail(req.body.trail);
    await trail.save();
    req.flash('success', 'Successfully made a new Trail')
    res.redirect(`/trails/${trail._id}`)

}))
router.get('/:id', catchAsync(async(req, res) => {
    const trail = await Trail.findById(req.params.id).populate('reviews');

    res.render('trails/show', { trail });
}))

router.get('/:id/edit', catchAsync(async(req, res) => {
    const trail = await Trail.findById(req.params.id)
    res.render('trails/edit', { trail });
}))

router.put('/:id', validateTrail, catchAsync(async(req, res) => {
    const { id } = req.params;
    const trail = await Trail.findByIdAndUpdate(id, {...req.body.trail })
    req.flash('success', 'Successfully Updated Trail')
    res.redirect(`/trails/${trail._id}`)
}))

router.delete('/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    await Trail.findByIdAndDelete(id);
    req.flash('success', 'Sucessfully Deleted Trail')
    res.redirect('/trails')
}))

module.exports = router;