const express = require('express');
const passport = require('passport');
const { User } = require('../../models');

const router = express.Router();

router.patch(
  '/:UserId/follow',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const user = await User.findOne({
        where: {
          id: req.params.UserId,
        },
      });
      if (!user) {
        return res.status(403).send('Check');
      }
      await user.addFollowers(req.user.id);
      res.status(200).json({ UserId: parseInt(req.params.UserId, 10) });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:UserId/unfollow',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const user = await User.findOne({
        where: {
          id: req.params.UserId,
        },
      });
      if (!user) {
        return res.status(403).send('Check');
      }
      await user.removeFollowers(req.user.id);
      res.status(200).json({ UserId: parseInt(req.params.UserId, 10) });
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
