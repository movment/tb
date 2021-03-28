const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const { Image, Post, User, Follow } = require('../../models');

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('COOKIE', req.cookies);
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

  // const users = posts.reduce((acc, cur) => {
  //   if (!acc[cur.UserId]) acc[cur.UserId] = cur.User;
  //   return acc;
  // }, {});

  // const result = await Promise.all(
  //   Object.keys(users).map((UserId) => {
  //     return Follow.findOne({
  //       where: {
  //         FollowingId: UserId,
  //         FollowerId: req.user.id,
  //       },
  //     });
  //   }),
  // );

  return res.json({ Posts: posts });
});

// 쿠키 사용하면 필요없어질 듯
router.get(
  '/update',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const posts = await Post.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'createdAt', 'UserId'],
      include: [
        { model: User, attributes: ['id', 'nickname'] },
        { model: User, as: 'Likers', where: { id: req.user.id } },
      ],
    });

    const users = posts.reduce((acc, cur) => {
      if (!acc[cur.UserId]) acc[cur.UserId] = cur.User;
      return acc;
    }, {});

    const result = await Promise.all(
      Object.keys(users).map((id) => {
        return Follow.findOne({
          where: {
            FollowingId: id,
            FollowerId: req.user.id,
          },
        });
      }),
    );
    result.forEach((cur) => {
      if (cur) users[cur.FollowingId].dataValues.isFollowing = true;
    });

    return res.json({ Likes: posts, users });
  },
);
router.get(
  '/update',
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
