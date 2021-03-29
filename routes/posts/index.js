const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const { Image, Post, User, Follow, Like } = require('../../models');

const router = express.Router();

router.get(
  '/',
  (req, res, next) => {
    passport.authenticate(
      'jwt',
      { session: false },
      async (err, user, info) => {
        if (err) return next(err);
        if (info) return next();

        const lastid = parseInt(req.query.lastid, 10);
        const userid = parseInt(req.query.userid, 10);
        const where = {};

        if (lastid) {
          where.id = { [Op.lt]: lastid };
        }
        if (userid) {
          where.UserId = userid;
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

        const likePosts = await Promise.all(
          posts.map((post) => {
            return Like.findOne({
              where: {
                PostId: post.id,
                UserId: user.id,
              },
            });
          }),
        );

        likePosts.forEach((like, index) => {
          if (like) {
            posts[index].dataValues.isLiked = true;
          }
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
                FollowerId: user.id,
              },
            });
          }),
        );
        result.forEach((cur) => {
          if (cur) users[cur.FollowingId].dataValues.isFollowing = true;
        });

        return res.json({ Posts: posts, users });
      },
    )(req, res, next);
  },
  async (req, res) => {
    const where = {};
    const lastid = parseInt(req.query.lastid, 10);
    const userid = parseInt(req.query.userid, 10);

    if (lastid) {
      where.id = { [Op.lt]: lastid };
    }
    if (userid) {
      where.UserId = userid;
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
  },
);

router.get(
  '/my',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const lastId = parseInt(req.query.lastId, 10);
    const where = { UserId: req.user.id };

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
    res.json({ Posts: posts });
  },
);

// 쿠키 사용하면 필요없어질 듯
// router.get(
//   '/update',
//   passport.authenticate('jwt', { session: false }),
//   async (req, res) => {
//     const posts = await Post.findAll({
//       limit: 10,
//       order: [['createdAt', 'DESC']],
//       attributes: ['id', 'createdAt', 'UserId'],
//       include: [
//         { model: User, attributes: ['id', 'nickname'] },
//         { model: User, as: 'Likers', where: { id: req.user.id } },
//       ],
//     });

//     const users = posts.reduce((acc, cur) => {
//       if (!acc[cur.UserId]) acc[cur.UserId] = cur.User;
//       return acc;
//     }, {});

//     const result = await Promise.all(
//       Object.keys(users).map((id) => {
//         return Follow.findOne({
//           where: {
//             FollowingId: id,
//             FollowerId: req.user.id,
//           },
//         });
//       }),
//     );
//     result.forEach((cur) => {
//       if (cur) users[cur.FollowingId].dataValues.isFollowing = true;
//     });

//     return res.json({ Likes: posts, users });
//   },
// );

module.exports = router;
