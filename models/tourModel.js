const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have less or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      // enum only for string not for numbers
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either : easy,medium,difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // min and max use not only for number but also work with date
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 //4.6666-->4.6666 * 10 --> Math.round(46.666) = 47 / 10 =4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // "this" key only points to current doc on new creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a Cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJson Inorder to spacify Geospatial
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        // exprcted type of each element in guides array to be mongodb id
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// INDEX
// tourSchema.index({ price: 1 });

// COMPOUND INDEX
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// VIRTUAL
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});
// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE :only runs before .save() and create() not insertMany
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// FOR EMBEDDED GUIDES
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
// regular expression /^find/ starts by find include findOne/findById
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// populate still create new query may affect your performace but no problem in small application
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} in millisecond`);
//   console.log(docs);
//   next();
// });

// aggregation middleware
// tourSchema.pre('aggregate', function(next) {
//   //correct by ---> if geoNear is first operator in pipeline do not do this otherwise in tourController distance error
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
