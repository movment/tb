const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { User } = require('../../models');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (user) return res.status(403).send('이미 사용중인 아이디입니다');

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });

    return res.send('OK');
  } catch (error) {
    return next(error);
  }
});

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
