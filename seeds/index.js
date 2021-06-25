const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
const Trail = require('../models/trails');


mongoose.connect('mongodb://localhost:27017/trails-critik', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection; //shortening code for easier readability
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)]


const seedDB = async() => {
    await Trail.deleteMany({}); // begin by deleting trails
    for (let i = 0; i < 50; i++) { // make random 50 trails with unique city/state/descriptors
        const random1000 = Math.floor(Math.random() * 1000);
        const trail = new Trail({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await trail.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
});