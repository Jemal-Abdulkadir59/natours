/*eslint-disable*/
const path = require('path'); //build-in module, which manipulate path name
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controllers/errorController');
const appError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

// SETTING UP PUG ENGINE
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//**************************GLOBAL MIDDELWARES*********************************
// serving static file
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(`${__dirname}/public`));

// SET SECURITY HTTP HEADER
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'unsafe-inline'],

      scriptSrc: ["'self'", 'https://*.cloudflare.com'],

      scriptSrcElem: ["'self'", 'https:', 'https://*.cloudflare.com'],

      styleSrc: ["'self'", 'https:', 'unsafe-inline'],

      connectSrc: ["'self'", 'data', 'https://*.cloudflare.com']
    }
  })
);
// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// RATE LIMIT from same API Brute force and DOS attack to prevent
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour! '
});
app.use('/api', limiter);

//BODY PARSER, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// PARSE DATA COMES FROM FORM
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//COOKI PARSER, in order to access cookies in requiest in express
app.use(cookieParser()); //in order protect our router access cookie from browser

//check login.js email : {"$gt":""} this always true and password the correct one -->that malicious query injection allows us to login only know the password prevent using Data sanitization against NOSQL query injection

//Data sanitization against NOSQL query injection
app.use(mongoSanitize()); // looking req.body, req.query string and also req.params filter out dolar signes and dote

//Data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    // whitelist is simple allow duplicate in query string
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
); //to check postman sort=duration&sort=price

// TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// ROUTER / MOUNTING
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// HANDLING UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  next(new appError(`can't find ${req.originalUrl} on this server!`, 404));
});

//GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
