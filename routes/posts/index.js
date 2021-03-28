const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const { Image, Post, User } = require('../../models');

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
    order: [['createdAt', 'DESC']],
    include: [
      { model: Image },
      { model: User, attributes: ['id', 'nickname'] },
    ],
  });

  return res.json({ Posts: posts });
});

// 쿠키 사용하면 필요없어질 듯
router.get(
  '/likes',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const posts = await Post.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'createdAt'],
      include: [{ model: User, as: 'Likers', where: { id: req.user.id } }],
    });

    return res.json({ Likes: posts });
  },
);

module.exports = router;
