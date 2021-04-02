const express = require('express');
const passport = require('passport');
const { User } = require('../../models');

const router = express.Router();

router.patch(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      await User.update(
        {
          nickname: req.body.nickname,
        },
        {
          where: { id: req.user.id },
        },
      );
      res.status(200).json({ id: req.user.id, nickname: req.body.nickname });
    } catch (error) {
      res.status(500).end();
    }
  },
);

module.exports = router;
