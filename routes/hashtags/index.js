const express = require('express');
const { Hashtag, sequelize, Post } = require('../../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const hashtags = await Hashtag.findAll({
    include: [{ model: Post, attributes: ['id'] }],
    includeIgnoreAttributes: false,
    attributes: [
      'id',
      'name',
      [sequelize.fn('COUNT', sequelize.col('Posts.id')), 'count'],
    ],
    group: ['id'],
    order: [[sequelize.literal('`count`'), 'DESC']],
    raw: true,
  });

  res.json(hashtags.slice(0, 5));
});

module.exports = router;
