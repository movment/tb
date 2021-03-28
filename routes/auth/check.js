const express = require('express');
const passport = require('passport');
const { User } = require('../../models');

const router = express.Router();
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['createdAt', 'email', 'id', 'nickname'],
      raw: true,
    });
    res.json({
      User: user,
      isLoggedIn: true,
    });
  },
);
// router.get(
//   '/',
//   (req, res, next) => {
//     if (req.headers.authorization)
//       return passport.authenticate('jwt', { session: false })(req, res, next);
//     return res.status(200).end();
//   },
//   async (req, res) => {
//     const userPromise = User.findOne({
//       where: { id: req.user.id },
//       attributes: ['email', 'id', 'nickname', 'createdAt'],
//       raw: true,
//     });
//     const countPromise = Post.count({
//       where: {
//         UserId: req.user.id,
//       },
//     });
//     const followerPromise = Follow.count({
//       where: {
//         FollowingId: req.user.id,
//       },
//     });
//     const followingPromise = Follow.count({
//       where: {
//         FollowerId: req.user.id,
//       },
//     });

//     const [user, count, erCount, ingCout] = await Promise.all([
//       userPromise,
//       countPromise,
//       followerPromise,
//       followingPromise,
//     ]);
//     user.PostsCount = count;
//     user.FollowerCount = erCount;
//     user.FollowingCount = ingCout;

//     res.json({ User: user });
//   },
// );

module.exports = router;
