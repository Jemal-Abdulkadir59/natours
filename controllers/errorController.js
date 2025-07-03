/*eslint-disable*/
const AppError = require('../utils/appError');

// CAST ERROR DB
const handleCastErrorDB = err => {
  // console.log(err)
  const message = `Invalid ${err.path}: ${err.value}.`;

  return new AppError(message, 400);
};

// DUPLICATE FIELDS ERROR DB
const handleDuplicateFieldsDB = err => {
  const value = err.keyValue.name;

  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

// VALIDIDATION ERROR DB
const handleValidationErrorDB = err => {
  const error = Object.values(err.errors).map(el => el.message);

  const message = `Invalid Input data. ${error.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again!', 401);

const sendErrorDev = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  //B) RENDERED WEBSITE
  console.error('Error 🧨', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};
const sendErrorProd = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    //A. Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    //B. programming or other unknown error:don't leak error details
    // 1) Log to error
    console.error('Error 🧨', err);

    // 2)send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Somthing went very wrong!'
    });
  }
  //B) RENDER WEBSITE
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  // programming or other unknown error:don't leak error details
  // 1) Log to error
  console.error('Error 🧨', err);

  // 2)send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

     // HANDLING INVALID DATABASE ID
    if (error.name === 'CastError') error = handleCastErrorDB(error); 
 
    // HANDLEING DUPLICATE DATABASE FIELD  
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
   
    //  HADNLING MONGOOSE VALIDATION ERRORS
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
