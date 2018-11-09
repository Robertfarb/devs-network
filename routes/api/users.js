const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

// @route GET api/users/test
// @desc Test users route
// @access Public
router.get('/test', (req, res) => res.json({message: "Users Works"}));

// @route POST api/users/register
// @desc Register User
// @access Public
router.post('/register', (req, res) => {
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
          password: req.body.password
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
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ email: 'User email not found' });
      }
      // Check passowrd
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // Send back a jsonwebtoken
            res.json({ message: "Success!" })
          } else {
            return res.status(400).json({ password: "Password is incorrect" })
          }
        })
    });
});

module.exports = router;