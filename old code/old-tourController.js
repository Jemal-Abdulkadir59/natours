// 1A) FILTERING
// const queryObj = { ...req.query };
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach(el => delete queryObj[el]);

// // 1B) ADVANCED FILTERING
// let queryStr = JSON.stringify(queryObj);
// // regular expression
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

// let query = Tour.find(JSON.parse(queryStr));

// 2)SORTING
// if (req.query.sort) {
//   //sort('price ratingsAvarage')
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('-createdAt');
// }

// 3) LIMITING FIELDS
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');

//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

// PAGINATION
// //page=3&limit=10, 1-10 page 1, 11-20 page 2 , 21-30 page 3
// //page=3&limit=3, 1-3 page 1, 4-6 page 2 , 7-9 page 3

// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;

// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numTours = await Tour.countDocuments();

//   if (skip >= numTours) throw new Error('this page does not exist');
// }

// MONGOOSE FILTER METHODS
// const tours = await Tour.find()
//   .where('duration')
//   .equals(5)
//   .where('difficulty')
//   .equals('easy');

// HANDLING UNHANDLED ROUTES
// app.all('*', (req, res, next) => {
//     // res.status(404).json({
//     //   status: 'fail',
//     //   message: `can't find ${req.originalUrl} on this server!`
//     // });

//     const err = new Error(`can't find ${req.originalUrl} on this server!`);
//     err.status = 'fail';
//     err.statusCode = 404;

//     next(err);
//   });

// BEFORE CATCHING ERROR IN ASYNC FUNCTIONS
// exports.createTour = async (req, res) => {
//     try {
//       //  const newTour = new Tour({});
//       // newTour.save()

//       const newTour = await Tour.create(req.body);

//       res.status(201).json({
//         status: 'success',
//         data: {
//           tours: newTour
//         }
//       });
//     } catch (err) {
//       res.status(400).json({
//         status: 'fail',
//         message: err
//       });
//     }
//   };
