const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Post, User } = require('../../models');

const router = express.Router();

router.post('/', (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      if (err) return next(err);
      if (info) return res.status(401).send(info.reason);

      const data = await User.findOne({
        where: { id: user.id },
        attributes: ['email', 'id', 'nickname'],
        include: [
          { model: Post },
          { model: User, as: 'Followings' },
          { model: User, as: 'Followers' },
        ],
      });
      const token = jwt.sign(
        { id: user.id, nickname: user.nickname },
        process.env.JWT_KEY,
        {
          expiresIn: '1h',
        },
      );

      return res.json({
        token,
        User: data,
      });
    },
  )(req, res, next);
});

module.exports = router;
