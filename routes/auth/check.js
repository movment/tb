const express = require('express');
const passport = require('passport');
const { User } = require('../../models');

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['createdAt', 'email', 'id', 'nickname'],
      raw: true,
    });
    res.json({
      User: user,
    });
  },
);

module.exports = router;
