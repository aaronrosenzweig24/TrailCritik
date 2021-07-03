const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { trailSchema, reviewSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const { join } = require('path');
const Review = require('./models/review');
const Trail = require('./models/trails');

const trails = require('./routes/trails')

mongoose.connect('mongodb://localhost:27017/trails-critik', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection; //shortening code for easier readability
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})
const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))




const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}

app.use("/trails", trails);


app.get('/', (req, res) => {
    res.render('home')
})

app.post('/trails/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const trail = await Trail.findById(req.params.id);
    const review = new Review(req.body.review);
    trail.reviews.push(review);
    await review.save();
    await trail.save();
    res.redirect(`/trails/${trail._id}`);
}))

app.delete('/trails/:id/reviews/:reviewId', catchAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Trail.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/trails/${id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, Something went wrong!'
    res.status(statusCode).render('error', { err });

})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})