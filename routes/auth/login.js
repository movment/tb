const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Follow, Post, User } = require('../../models');

const router = express.Router();

router.post('/', (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      if (err) return next(err);
      if (info) return res.status(401).send(info.reason);

      const token = jwt.sign(
        { id: user.id, nickname: user.nickname },
        process.env.JWT_KEY,
        {
          expiresIn: '24h',
        },
      );

      const userPromise = User.findOne({
        where: { id: user.id },
        attributes: ['email', 'id', 'nickname', 'createdAt'],
        raw: true,
      });
      const countPromise = Post.count({
        where: {
          UserId: user.id,
        },
      });
      const followerPromise = Follow.count({
        where: {
          FollowingId: user.id,
        },
      });
      const followingPromise = Follow.count({
        where: {
          FollowerId: user.id,
        },
      });

      const [data, count, erCount, ingCout] = await Promise.all([
        userPromise,
        countPromise,
        followerPromise,
        followingPromise,
      ]);
      data.PostsCount = count;
      data.FollowerCount = erCount;
      data.FollowingCount = ingCout;
      res.cookie('token', token, {
        maxAge: 1000 * 60 * 60 * 48,
        httpOnly: true,
      });
      return res.json({
        token,
        User: data,
      });
    },
  )(req, res, next);
});

module.exports = router;
