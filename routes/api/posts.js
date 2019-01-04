const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
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

// @route DELETE api/posts/:post_id
// @desc Delete Post
// @access Private
router.delete('/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if(post.user.toString() !== req.user.id) {
            return res.status(401).json({ notauthorized: "User not authorized" })
          }

          post.remove().then(() => res.json({ success: true }))
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    })
});

// @route POST api/posts/like/:id
// @desc Like Post
// @access Private
router.post('/like/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ alreadyLiked: 'User alreay liked this post' })
          }

          // Add user id to the likes array of a Post
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post)); 
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    })
});

// @route POST api/posts/unlike/:id
// @desc Unlike post
// @access Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ notLiked: 'You have not yet liked this post' });
          }
          
          // Find the user currently logged in to remove from the likes array
          const removeIdx = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          post.likes.splice(removeIdx, 1);

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    })
});

// @route POST api/posts/unlike/:id
// @desc Unlike post
// @access Private



module.exports = router;