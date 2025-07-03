const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empity! ']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour!']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

//STATIC METHID
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  //  in static "this" key point current model
  // we need aggregate on Model directly thats why we use here static method this key point model and call aggregate
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // this key point to current  document and constructor point the model who created that document
  // Review.calcAverageRatings(this.tour) Review not defined in this cease
  //this.constructor //constructor point Tour model
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate, findByIdAndDelete
// if we use post here we no longer have access to the query because query already excuted so without query we can not save review documnet and run calcAverageRatings function
reviewSchema.pre(/^findOneAnd/, async function(next) {
  //this key word point current query but we need current doc so, execute the query and that give us a document that currently processed
  // const r = await this.findOne();
  // console.log(r) give us current updated documetn
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
