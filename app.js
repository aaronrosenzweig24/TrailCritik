const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { trailSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const Trail = require('./models/trails');
const ExpressError = require('./utils/ExpressError');
const { join } = require('path');


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


const validateTrail = (req, res, next) => {
    const { error } = trailSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next()
    }

}

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/trails', catchAsync(async(req, res) => {
    const trails = await Trail.find({});
    res.render('trails/index', { trails })
}))
app.get('/trails/new', (req, res) => {
    res.render('trails/new')
})
app.post('/trails', validateTrail, catchAsync(async(req, res) => {
    // if (!req.body.trail) throw new ExpressError('Invalid Trail Data', 400)

    const trail = new Trail(req.body.trail);
    await trail.save();
    res.redirect(`/trails/${trail._id}`)

}))
app.get('/trails/:id', catchAsync(async(req, res) => {
    const trail = await Trail.findById(req.params.id)
    res.render('trails/show', { trail });
}))

app.get('/trails/:id/edit', catchAsync(async(req, res) => {
    const trail = await Trail.findById(req.params.id)
    res.render('trails/edit', { trail });
}))

app.put('/trails/:id', validateTrail, catchAsync(async(req, res) => {
    const { id } = req.params;
    const trail = await Trail.findByIdAndUpdate(id, {...req.body.trail })
    res.redirect(`/trails/${trail._id}`)
}))

app.delete('/trails/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    await Trail.findByIdAndDelete(id);
    res.redirect('/trails')
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