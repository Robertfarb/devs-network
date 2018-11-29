const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const Post = require('../../models/Post');
const validatePostInput = require('../../validation/post');



// @route GET api/posts/test
// @desc Test Post Route
// @access Public
router.get('/test', (req, res) => res.json({message: "Posts Work"}));

// @route POST api/posts
// @desc Create post
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  })

  newPost.save().then(post => res.json(post));
});

// @route GET api/posts
// @desc Fetch All Posts
// @access Public
router.get('/', (req, res) => {
  Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ posts: "There are no posts found" }));
});

// @route GET api/posts/:post_id
// @desc Fetch single post
// @access Public
router.get('/:post_id', (req, res) => {
  Post.findById(req.params.post_id)
  .then(post => res.json(post))
  .catch(err => res.status(404).json({ nopostfound: "There is no post found with that ID" }));
});


module.exports = router;