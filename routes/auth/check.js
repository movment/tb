const express = require('express');
const passport = require('passport');
const { User } = require('../../models');

const router = express.Router();

// Next.js에서 확인
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: ['id', 'nickname'],
      });

      res.json({
        User: user,
      });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  },
);

module.exports = router;
