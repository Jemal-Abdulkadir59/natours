const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const {
  getAlltour,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan
} = tourController;

const router = express.Router();
// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAlltour);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router
  .route('/')
  .get(authController.protect, getAlltour)
  .post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTour
  );

// POST /tour/34usg32/reviews
// GET /tour/jhr3232f/reviews
// GET /tour/jhr3232f/reviews/34jgs32g

// NESTED ROUTES TO CREARE NEW REVIEW
router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );
module.exports = router;
