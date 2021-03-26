const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Image, Post, User, Like } = require('../../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const lastId = parseInt(req.query.lastId, 10);
  const where = {};
  if (lastId) {
    where.id = { [Op.lt]: lastId };
  }
  const token = req.headers.authorization?.split('Bearer ')[1];

  const posts = await Post.findAll({
    where,
    limit: 10,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Image },
      { model: User, attributes: ['id', 'nickname'] },
    ],
  });
  posts.forEach((cur) => {
    if (cur.id === 65) console.log(cur.content);
  });
  if (!token) {
    return res.json({ Posts: posts });
  }
  console.log(await Like.findAll());
  const decoded = jwt.decode(token, process.env.JWT_KEY);

  // 최적화 필요
  const arr = await Promise.all(
    posts.map((post) =>
      Post.findOne({
        where: { id: post.id },
        include: [
          { model: User, attributes: ['id'], where: { id: decoded.id } },
        ],
      }),
    ),
  );

  return res.json({ Posts: posts });
});

module.exports = router;
