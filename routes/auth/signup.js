const bcrypt = require('bcrypt');
const express = require('express');
const { isNotLoggedIn } = require('../../middlewares/auth');
const { User } = require('../../models');

const router = express.Router();

router.post('/', isNotLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (user) return res.status(403).send('이미 사용중인 아이디입니다');

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });

    return res.send('OK');
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
