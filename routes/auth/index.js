const express = require('express');
const loginRouter = require('./login');
const logoutRouter = require('./logout');
const checkRouter = require('./check');
const nicknameRouter = require('./nickname');
const signupRouter = require('./signup');

const router = express.Router();

router.use('/login', loginRouter);
router.use('/logout', logoutRouter);
router.use('/check', checkRouter);
router.use('/nickname', nicknameRouter);
router.use('/signup', signupRouter);

module.exports = router;
