const mongoose = require('mongoose');
const Review = require('./review')
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

TrailCritikSchema.post('findOneAndDelete',
    async function(doc) {
        if (doc) {
            await Review.deleteMany({
                _id: {
                    $in: doc.reviews
                }
            })
        }
    })

module.exports = mongoose.model('trails', TrailCritikSchema)