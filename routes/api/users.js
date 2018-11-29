const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const User = require('../../models/User');

// Load Input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// @route GET api/users/test
// @desc Test users route
// @access Public
router.get('/test', (req, res) => res.json({message: "Users Works"}));

// @route POST api/users/register
// @desc Register User
// @access Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check for proper form validation
  if(!isValid) {
    res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res.status(400).json({ email: "Email already exists" });
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', // size
          r: 'pg',  // rating
          d: 'mm'  // default
        });

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password,
          password2: req.body.password2
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        })
      }
    });
});

// @route GET api/users/login
// @desc Login User
// @access Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  User.findOne({ email })
    .then(user => {
      if (!user) {
        errors.email = "User not found"
        return res.status(404).json(errors);
      }
      // Check passowrd
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // User matched, create JWT payload
            const payload = { id: user.id, name: user.name, avatar: user.avatar }
            // Sign token
            jwt.sign(
              payload, 
              keys.secretOrKey, 
              { expiresIn: 3600 }, 
              (err, token) => {
                res.json({
                  success: true,
                  token: `Bearer ${token}`
                })
            });
          } else {
            errors.password = "Password is inccorect"
            return res.status(400).json(errors)
          }
        })
    });
});

// @route GET api/users/current
// @desc Return Current User
// @access Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  const curr_user = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  }

  res.json(curr_user);
});

module.exports = router;