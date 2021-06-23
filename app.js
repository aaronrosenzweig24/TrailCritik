const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Trail = require('./models/trails');


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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.render('home')
})
app.get('/makeTrail', async(req, res) => {
    const trail = new Trail({ title: 'My trail', description: 'philly trail' })
    await trail.save();
    res.send(trail)
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})