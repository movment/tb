const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User, Post, Follow } = require('../../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const kakaoToken = req.headers.authorization;

  const { data } = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: kakaoToken,
    },
  });

  const [user] = await User.findOrCreate({
    where: { email: data.id },
    defaults: {
      nickname: data.properties.nickname,
      email: data.id,
      password: process.env.JWT_KEY,
    },
  });
  const token = jwt.sign(
    { id: user.id, nickname: user.nickname },
    process.env.JWT_KEY,
    {
      expiresIn: '10d',
    },
  );

  res.cookie('token', token, {
    maxAge: 1000 * 60 * 60 * 48,
    httpOnly: true,
  });
  res.json({});
});

module.exports = router;
