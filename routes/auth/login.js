const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../../models');

const router = express.Router();

router.post('/', (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      if (err) {
        res.status(500).send('Server Error');
        return;
      }
      if (info) {
        res.status(401).send(info.reason);
        return;
      }

      try {
        const token = jwt.sign(
          { id: user.id, nickname: user.nickname },
          process.env.JWT_KEY,
          {
            expiresIn: '10d',
          },
        );
        const result = await User.findOne({
          where: { id: user.id },
          attributes: ['id', 'nickname'],
          raw: true,
        });
        // const userPromise = User.findOne({
        //   where: { id: user.id },
        //   attributes: ['email', 'id', 'nickname', 'createdAt'],
        //   raw: true,
        // });
        // const countPromise = Post.count({
        //   where: {
        //     UserId: user.id,
        //   },
        // });
        // const followerPromise = Follow.count({
        //   where: {
        //     FollowingId: user.id,
        //   },
        // });
        // const followingPromise = Follow.count({
        //   where: {
        //     FollowerId: user.id,
        //   },
        // });

        // const [data, count, erCount, ingCout] = await Promise.all([
        //   userPromise,
        //   countPromise,
        //   followerPromise,
        //   followingPromise,
        // ]);
        // data.PostsCount = count;
        // data.FollowerCount = erCount;
        // data.FollowingCount = ingCout;

        res.cookie('token', token, {
          maxAge: 1000 * 60 * 60 * 48,
          httpOnly: true,
          secure: true,
        });

        res.json({ User: result });
      } catch (error) {
        res.status(500).send('Server Error');
      }
    },
  )(req, res, next);
});

module.exports = router;
