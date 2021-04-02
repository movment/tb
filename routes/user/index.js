const express = require('express');
const passport = require('passport');
const { User, Follow } = require('../../models');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const userPromise = User.findOne({
    where: { id: req.params.id },
    attributes: ['createdAt', 'id', 'nickname'],
  });
  const followerPromise = Follow.count({
    where: {
      FollowingId: req.params.id,
    },
  });
  // console.log(followerPromise);
  const followingPromise = Follow.count({
    where: {
      FollowerId: req.params.id,
    },
  });
  // console.log(followingPromise);
  const [user, follower, following] = await Promise.all([
    userPromise,
    followerPromise,
    followingPromise,
  ]);
  res.json({ User: user, follower, following });
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

router.get('/:id/followers', async (req, res) => {
  let user;

  try {
    const UserId = req.params.id;

    user = await User.findOne({ where: { id: UserId } });

    const auth = jwt.verify(req.cookies.token, process.env.JWT_KEY);

    const followers = await user.getFollowers({
      attributes: ['id', 'nickname'],
      include: [
        {
          model: User,
          as: 'Followers',
          where: { id: auth.id },
          attributes: ['id', 'nickname'],
          required: false,
          raw: true,
        },
      ],
      raw: true,
    });
    const newFollowers = followers.map((follower) => {
      const obj = { id: follower.id, nickname: follower.nickname };
      if (follower['Followers.id'] === 1) obj.isFollowing = true;
      return obj;
    });

    return res.status(200).json(newFollowers);
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      const followers = await user.getFollowers({
        attributes: ['id', 'nickname'],
        raw: true,
      });
      return res.json(followers);
    }
    return res.status(500).send('Server Error');
  }
});
router.get('/:id/followings', async (req, res) => {
  let user;
  try {
    const UserId = req.params.id;

    user = await User.findOne({ where: { id: UserId } });

    const auth = jwt.verify(req.cookies.token, process.env.JWT_KEY);

    const followings = await user.getFollowings({
      attributes: ['id', 'nickname'],
      include: [
        {
          model: User,
          as: 'Followings',
          where: { id: auth.id },
          attributes: ['id', 'nickname'],
          required: false,
          raw: true,
        },
      ],
      raw: true,
    });
    const newFollowers = followings.map((following) => {
      const obj = { id: following.id, nickname: following.nickname };
      if (following['Followings.id'] === 1) obj.isFollowing = true;
      return obj;
    });

    return res.status(200).json(newFollowers);
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      const followings = await user.getFollowings({
        attributes: ['id', 'nickname'],
      });

      return res.status(200).json(followings);
    }
    return res.status(500).send('Server Error');
  }
});
module.exports = router;
