const express = require('express');
const { sequelize, Hashtag, Post } = require('../../models');

const router = express.Router();

// limit을 추가하면 에러 발생
router.get('/', async (_, res) => {
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
