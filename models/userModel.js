/*eslint-disable*/
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please povide a valid email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLenght: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only work create or save! not example findOne or update
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// ENCRYPT PASSWORD
userSchema.pre('save', async function(next) {
  //Only run this function if the password was actulay modified
  if (!this.isModified('password')) return next();

  // ENCRYPT PASSWORD WITH SALT AND HASH (bcrypt)
  // Hash the password cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// SET PASSWORD CHANGED AT IN DB
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  // we subtract 1 second or 1000 mile second because in resetPassword signToken(user._id) create before passwordChangedAt set. in protect methods changePasswordAfter compare time and triger error
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function(next) {
  //this points to current query
  this.find({ active: { $ne: false } });

  next();
});

// INSTANT METHODS : which we can call on document
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userpassword
) {
  return await bcrypt.compare(candidatePassword, userpassword);
};

userSchema.methods.changePasswordAfter = function(JWTTimestamps) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return changedTimestamp > JWTTimestamps;
  }
  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //ENCRYPT PASSWORD WITH reset token(sha256)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
