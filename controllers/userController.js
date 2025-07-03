/*eslint-disable*/
const sharp = require('sharp');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');

// UPLOAD USER PHOTO
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb)=>{
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb)=>{
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })

// the image stored as buffer
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb)=>{
  // test uploaded file is an image if it img pass true to cb if not false, cb means callback
  if(file.mimetype.startsWith('image')){
    cb(null, true)
  }else{
    cb(new AppError('Not an image! Please upload only images. ',400), false)
  }
}
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})
exports.uploadUserPhoto = upload.single('photo')

// sharp package : npm i sharp
exports.resizeUserPhoto = catchAsync(async(req, res, next)=>{
 if(!req.file) return next()

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  // instead of write file to disk and read here again, simply keep the image in memory buffer and then read here 
 await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)
    next()
})

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

// UPDATE USER DATA
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2. Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if(req.file) filteredBody.photo = req.file.filename
  // 3. update user document
  // new: true --> return new document basicly updated object
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser
    }
  });
});

// DELETE CURRENT USER
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not defined! Please use /signup instead '
  });
};

exports.getAllUser = factory.getAll(User);
exports.getUser = factory.getOne(User);

//ONLY ADMIN UPDATE AND DELETE USER FROM DATABASE
//DO NOT UPDATE password with this!
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
