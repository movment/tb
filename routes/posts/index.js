const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Follow, Hashtag, Image, Post, User } = require('../../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const { search } = req.query;
  const lastid = parseInt(req.query.lastid, 10);
  const userid = parseInt(req.query.userid, 10);
  const where = {};

  if (lastid) where.id = { [Op.lt]: lastid };
  if (userid) where.UserId = userid;
  if (search) where.content = { [Op.like]: `%${search}%` };

  try {
    const user = jwt.verify(req.cookies.token, process.env.JWT_KEY);

    const include = [
      { model: Image },
      {
        model: User,
        attributes: ['id', 'nickname'],
        include: [
          {
            model: User,
            as: 'Followers',
            where: { id: user.id },
            attributes: ['id'],
            required: false,
          },
        ],
      },
      {
        model: User,
        as: 'Likers',
        attributes: ['id'],
        where: {
          id: user.id,
        },
        required: false,
      },
    ];

    if (req.query.hashtag)
      include.push({ model: Hashtag, where: { name: req.query.hashtag } });

    const posts = await Post.findAll({
      where,
      limit: 10,
      order: [['createdAt', 'DESC']],
      include,
    });

    // 팔로잉 수정
    const users = posts.reduce((acc, cur) => {
      if (!acc[cur.UserId]) acc[cur.UserId] = cur.User;
      return acc;
    }, {});
    const result = await Promise.all(
      Object.keys(users).map((id) => {
        return Follow.findOne({
          where: {
            FollowingId: id,
            FollowerId: user.id,
          },
        });
      }),
    );
    result.forEach((cur) => {
      if (cur) users[cur.FollowingId].dataValues.isFollowing = true;
    });

    res.json({ Posts: posts, users });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      const include = [
        { model: Image },
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
      ];

      if (req.query.hashtag)
        include.push({ model: Hashtag, where: { name: req.query.hashtag } });

      const posts = await Post.findAll({
        where,
        limit: 10,
        order: [['createdAt', 'DESC']],
        include,
      });

      res.json({ Posts: posts });
      return;
    }

    if (error.name === 'TokenExpiredError') {
      res.status(403).send('다시 로그인해주세요');
      return;
    }

    res.status(500).send('Server Error');
  }
});

module.exports = router;
