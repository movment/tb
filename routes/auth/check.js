const express = require('express');
const passport = require('passport');
const { Post, User } = require('../../models');

const router = express.Router();

router.get(
  '/',
  (req, res, next) => {
    if (req.headers.authorization)
      return passport.authenticate('jwt', { session: false })(req, res, next);
    return res.status(200).end();
  },
  async (req, res) => {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['email', 'id', 'nickname'],
      include: [
        { model: Post },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
      ],
    });

    res.json({ User: user });
  },
);

module.exports = router;
