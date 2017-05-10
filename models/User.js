"use strict";

// Initialization
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const SALT_WORK_FACTOR = 10;

// User schema
var userSchema = mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    match: "/\S+@\S+\.\S+/",
    index: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    trim: true,
    enum: ['admin', 'coach', 'supervisor', 'auxiliary', 'customer', 'family', 'guest'],
    default: ['guest']
  },
  employee_id: {
    type: Number,
    trim: true
  },
  customer_id: {
    type: Number,
    trim: true
  }
}, { timestamps: true });
// timestamps allows the db to automatically create 'created_at' and 'updated_at' fields

userSchema.pre('save', function(next) {
    var user = this;
    // Check email validity
    if (user.isModified('email')) {
        if (!validator.isEmail(this.email)) {
            var error = new Error();
            error.name = "InvalidEmail";
            return next(error);
        }
    }
    // Check if password is modified, then encrypt it thanks to bcrypt
    if (!user.isModified('password')) {
        return next();
    } else {
      bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
          return next(err);
        }
        // next();
        bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) {
            return next(err);
          }
          user.password = hash;
          return next();
        }); // bcrypt.hash
      }); // bcrypt.genSalt
    }; // else {}
});

// Method to compare password to encrypted one
userSchema.methods.comparePassword = function(passwordGiven, cb) {
  bcrypt.compare(passwordGiven, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model("User", userSchema);
