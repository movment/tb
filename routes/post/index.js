const express = require('express');
const path = require('path');
const passport = require('passport');
const multer = require('multer');
const { Op } = require('sequelize');

const {
  Comment,
  Image,
  Post,
  User,
  Hashtag,
  Sequelize,
} = require('../../models');

const router = express.Router();

router.get('/:PostId', async (req, res) => {
  const { PostId } = req.params;
  const post = await Post.findOne({ where: { id: PostId } });
  if (!post) return res.status(404).send('존재하지 않는 게시글입니다');

  const fullPost = await Post.findOne({
    where: { id: PostId },

    include: [
      {
        model: Post,
        as: 'Retweet',
        include: [
          {
            model: User,
            attributes: ['id', 'nickname'],
          },
        ],
      },
      {
        model: User,
        attributes: ['id', 'nickname'],
      },
      {
        model: Image,
      },
    ],
  });

  res.status(200).json(fullPost);
});

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const post = await Post.create({
        content: req.body.content,
        UserId: req.user.id,
      });

      const hashtags = req.body.content.match(/#[^\s#]+/g);

      if (hashtags) {
        const result = await Promise.all(
          hashtags.map((tag) =>
            Hashtag.findOrCreate({
              where: { name: tag.slice(1).toLowerCase() },
            }),
          ),
        );

        await post.addHashtags(result.map((v) => v[0]));
      }
      console.log(req.body.imagePaths);
      if (req.body.imagePaths) {
        if (Array.isArray(req.body.imagePaths)) {
          const images = await Promise.all(
            req.body.imagePaths.map((image) =>
              Image.create({ src: image, PostId: post.id }),
            ),
          );
        } else {
          console.log(1);
          const image = await Image.create({
            src: req.body.imagePaths[0],
            PostId: post.id,
          });
        }
      }
      const data = post.toJSON();
      const imagePaths = await Image.findAll({
        where: { PostId: post.id },
        attributes: ['src'],
      });
      console.log(imagePaths);
      data.User = req.user;
      data.Images = imagePaths;
      res.status(201).json({ post: data });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/:PostId/comment',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const post = await Post.findOne({
        where: {
          id: req.params.PostId,
        },
      });

      if (!post) return res.status(403).send('존재하지 않는 게시글입니다');

      const comment = await Comment.create({
        content: req.body.content || ' ',
        PostId: parseInt(req.params.PostId, 10),
        UserId: req.user.id,
      });

      const fullComment = await Comment.findOne({
        where: { id: comment.id },
        include: [
          {
            model: User,
            attributes: ['id', 'nickname'],
          },
        ],
      });
      return res.status(201).json(fullComment);
    } catch (error) {
      return next(error);
    }
  },
);
router.get('/:PostId/comments', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const count = await Comment.count({ where: { PostId: req.params.PostId } });
    console.log(req.params.PostId);
    console.log(count, parseInt(count / 10, 10));
    console.log(10 * (parseInt(count / 10, 10) - page + 1));
    const comments = await Comment.findAll({
      offset: 10 * (parseInt(count / 10, 10) - page + 1),
      limit: 10,
      where: {
        PostId: req.params.PostId,
      },
      include: [{ model: User, attributes: ['id', 'nickname'] }],
    });

    return res.status(200).json({ comments, total: count });
  } catch (error) {
    return next(error);
  }
});
router.post(
  '/:PostId/retweet',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const post = await Post.findOne({
        where: { id: req.params.PostId },
        include: [{ model: Post, as: 'Retweet' }],
      });
      if (req.user.id === post.UserId || post?.Retweet.UserId === req.user.id) {
        return res.status(403).send('자신의 글은 리트윗할 수 없습니다');
      }
      const retweetPostId = post.RetweetId || post.id;
      const exPost = await Post.findOne({
        where: {
          UserId: req.user.id,
          RetweetId: retweetPostId,
        },
      });
      if (exPost) {
        res.status(403).send('이미 리트윗했습니다');
      }
      const result = await Post.create({
        UserId: req.user.id,
        content: 'retweet',
        RetweetId: retweetPostId,
      });
      const retweetOrigin = await Post.findOne({
        where: {
          id: result.id,
          include: [
            {
              model: Post,
              as: 'Retweet',
              include: [
                { model: User, attributes: ['id', 'nickname'] },
                { model: Image },
              ],
            },
            { model: User, attributes: ['id', 'nickname'] },
            { model: User, as: 'Likers', attributes: ['id'] },
          ],
        },
      });
      res.json(retweetOrigin);
    } catch (error) {
      next(error);
    }
  },
);
router.patch(
  '/like',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const post = await Post.findOne({
        where: {
          id: req.body.PostId,
        },
      });
      if (!post) return res.status(403).send('게시글이 존재하지 않습니다');

      await post.addLikers(req.user.id);
      res.json({ PostId: post.id });
    } catch (error) {
      return next(error);
    }
  },
);
router.delete(
  '/unlike',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const post = await Post.findOne({
        where: {
          id: req.body.PostId,
        },
      });
      if (!post) return res.status(403).send('게시글이 존재하지 않습니다');

      await post.removeLikers(req.user.id);
      res.json({ PostId: post.id });
    } catch (error) {
      return next(error);
    }
  },
);

router.delete(
  '/:PostId',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      console.log(req.user.id);
      await Post.destroy({
        where: {
          id: req.params.PostId,
          UserId: req.user.id,
        },
      });
      console.log(req.user.id);
      return res.json({ PostId: parseInt(req.params.PostId, 10) });
    } catch (error) {
      return next(error);
    }
  },
);
router.get('/', async (req, res) => {
  const posts = await Post.findAll({
    limit: 10,
    offset: 0,
    order: [['createdAt', 'DESC']],
    include: [{ model: Image }, { model: Comment }, { model: User }],
  });

  res.json(posts);
});

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);

      done(null, basename + '_' + new Date().getTime() + ext);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});
router.post(
  '/images',
  passport.authenticate('jwt', { session: false }),
  upload.array('image'),
  async (req, res, next) => {
    console.log(req.files);
    res.json({ imagePaths: req.files.map((file) => file.filename) });
  },
);

module.exports = router;
