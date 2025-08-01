/*eslint-disable*/
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async(req, res, next)=>{
    //1) Get the currently booked tour    
    const tour = await Tour.findById(req.params.tourId)

    //2) create checkout sessions -> npm i stripe
   const session = await stripe.checkout.sessions.create({
    
        // information about session it self
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        // allow us pass our data about the secession currently created, important cuz once a purchase was success will get access the session again then we want create new booking in database
        client_reference_id:req.params.Id, 
        mode: 'payment', // or 'subscription' if you're using subscriptions
     
        // information about product the user about to purchase
        line_items:[
            {
                price_data:{
                    currency: 'usd',
                    unit_amount: tour.price * 100, // The amount in the smallest currency unit (e.g., cents for USD)
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },  
                },   
                quantity: 1 // The number of units the customer is buying
            }
        ],
        
    })

    //3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    })    
})

exports.createBookingCheckout = async (req, res, next)=>{
    // THIS IS ONLY TEMPORARY, BECAUSE ITS UNSECURE : everyone can make bookings without paying 
    const {tour, user, price} = req.query

    if(!tour && !user && !price) return next();
    
    await Booking.create({tour, user, price})

    // res.redirect(`${req.protocol}://${req.get('host')}/`)
    res.redirect(req.originalUrl.split('?')[0]) //hite home page second times without query  
    //  next()
}

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)