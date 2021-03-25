const express = require('express');
const { Op } = require('sequelize');
const { Comment, Image, Post, User } = require('../../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const lastId = parseInt(req.query.lastId, 10);
  const where = {};
  if (lastId) {
    where.id = { [Op.lt]: lastId };
  }

  const posts = await Post.findAll({
    where,
    limit: 10,
    order: [
      ['createdAt', 'DESC'],
      [Comment, 'createdAt', 'DESC'],
    ],
    include: [
      {
        model: Comment,
        include: [{ model: User, attributes: ['id', 'nickname'] }],
      },
      { model: Image },
      { model: User },
    ],
  });

  res.json(posts);
});

module.exports = router;
