const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Image, Post, User, Follow, Like, Hashtag } = require('../../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const where = {};
  const lastid = parseInt(req.query.lastid, 10);
  const userid = parseInt(req.query.userid, 10);
  const { search } = req.query;

  if (lastid) {
    where.id = { [Op.lt]: lastid };
  }
  if (userid) {
    where.UserId = userid;
  }
  if (search) {
    where.content = { [Op.like]: `%${search}%` };
  }

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
            required: false,
            where: { id: user.id },
            attributes: ['id'],
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

    // 팔로잉
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

    return res.json({ Posts: posts, users });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
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
      // res.clearCookie('token');
      return res.json({ Posts: posts });
    }

    res.status(500).send('Server Error');
  }
});

module.exports = router;
