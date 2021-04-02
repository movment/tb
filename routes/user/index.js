const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User, Follow } = require('../../models');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const userPromise = User.findOne({
      where: { id: req.params.id },
      attributes: ['createdAt', 'id', 'nickname'],
    });
    const followerPromise = Follow.count({
      where: {
        FollowingId: req.params.id,
      },
    });
    const followingPromise = Follow.count({
      where: {
        FollowerId: req.params.id,
      },
    });
    const [user, follower, following] = await Promise.all([
      userPromise,
      followerPromise,
      followingPromise,
    ]);

    res.json({ User: user, follower, following });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.put(
  '/follow',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findOne({
        where: {
          id: req.body.UserId,
        },
      });

      if (!user) {
        res.status(403).send('Check');
        return;
      }

      await user.addFollowers(req.user.id);

      res.status(200).json({ UserId: req.body.UserId });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  },
);

router.patch(
  '/unfollow',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findOne({
        where: {
          id: req.body.UserId,
        },
      });
      if (!user) {
        res.status(403).send('Check');
        return;
      }

      await user.removeFollowers(req.user.id);
      res.status(200).json({ UserId: req.body.UserId });
    } catch (error) {
      res.status(500).send('Server Error');
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
      if (follower['Followers.id'] === auth.id) obj.isFollowing = true;
      return obj;
    });

    res.status(200).json(newFollowers);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      const followers = await user.getFollowers({
        attributes: ['id', 'nickname'],
        raw: true,
      });

      res.json(followers);
      return;
    }

    if (error.name === 'TokenExpiredError') {
      res.status(403).send('다시 로그인해주세요');
      return;
    }

    res.status(500).send('Server Error');
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

    const newFollowings = followings.map((following) => {
      const obj = { id: following.id, nickname: following.nickname };
      if (following['Follows.FollowerId'] === auth.id) obj.isFollowing = true;
      return obj;
    });

    res.status(200).json(newFollowings);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      const followings = await user.getFollowings({
        attributes: ['id', 'nickname'],
      });

      res.status(200).json(followings);
      return;
    }
    if (error.name === 'TokenExpiredError') {
      res.status(403).send('다시 로그인해주세요');
      return;
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
