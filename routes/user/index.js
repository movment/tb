const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const { User, Post, Image } = require('../../models');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id },
    attributes: ['createdAt', 'id', 'nickname'],
  });

  res.json({ User: user });
});

router.put(
  '/follow',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const user = await User.findOne({
        where: {
          id: req.body.UserId,
        },
      });
      if (!user) return res.status(403).send('Check');

      await user.addFollowers(req.user.id);
      res.status(200).json({ UserId: req.body.UserId });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/unfollow',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const user = await User.findOne({
        where: {
          id: req.body.UserId,
        },
      });
      if (!user) {
        return res.status(403).send('Check');
      }

      await user.removeFollowers(req.user.id);
      res.status(200).json({ UserId: req.body.UserId });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/followers',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { user } = req;

      const followers = await user.getFollowers();
      res.status(200).json(followers);
    } catch (error) {
      next(error);
    }
  },
);
router.get(
  '/followings',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { user } = req;

      const followings = await user.getFollowings();
      res.status(200).json(followings);
    } catch (error) {
      next(error);
    }
  },
);
module.exports = router;
