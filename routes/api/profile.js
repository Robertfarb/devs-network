const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const validateProfileInput = require('../../validation/profile');

// @route GET api/profile/test
// @desc Test Profile Route
// @access Public
router.get('/test', (req, res) => res.json({message: "Profile Works"}));

// @route GET api/profile
// @desc Get current user's profile
// @access Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {}

  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noProfile = 'There is no profile for this user';
        return res.status(404).json(errors)
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route GET api/profile/handle/:handle
// @desc Get a specific Profile by handle
// @access Public
router.get('/handle/:handle', (req, res) => {
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user'
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err))
});

// @route GET api/profile/user/:user_id
// @desc Get a specific Profile by user_id
// @access Public
router.get('/user/:user_id', (req, res) => {
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user'
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({ profile: 'There is no profile for this User' }));
});

// @route GET api/profile/all
// @desc Get all profiles
// @access Public
router.get('/all', (req, res) => {
  Profile.find()
  .populate('user', ['name', 'avatar'])
  .then(profiles => {
    if (!profiles) {
      errors.noprofile = "There are no profiles"
      return res.status(404).json(errors)
    }
    res.json(profiles)
  })
  .catch(err => res.status(404).json({ profile: "There are no profiles" }))
})


// @route POST api/profile
// @desc Create / Update user profile
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);

  if (!isValid) {
    //Return errors with status 400
    return res.status(400).json(errors);
  }

  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

  // Split skills into an Array
  if (typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',');
  }

  // Social
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.social.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.social.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.social.facebook;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.social.linkedin;
  if (req.body.instagram) profileFields.social.instagram = req.body.social.instagram;

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Update existing Profile
      if (profile) {
        Profile.findOneAndUpdate(
          { user: req.user.id }, 
          { $set: profileFields }, 
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create Profile
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    })
});



module.exports = router;