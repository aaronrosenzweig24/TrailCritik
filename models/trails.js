const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrailCritikSchema = new Schema({
    title: String,
    image: String,
    description: String,
    location: String,
    price: Number,
    reviews: [{
        type: Schema.Types.ObjectID,
        ref: 'Review'
    }]
});

module.exports = mongoose.model('trails', TrailCritikSchema)