const express = require('express');
const passport = require('passport');
const { User } = require('../../models');

const router = express.Router();

router.patch(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      await User.update(
        {
          nickname: req.body.nickname,
        },
        {
          where: { id: req.user.id },
        },
      );
      res.status(200).json({ nickname: req.body.nickname });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
