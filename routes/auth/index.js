const express = require('express');
const checkRouter = require('./check');
const loginRouter = require('./login');
const signupRouter = require('./signup');
const nicknameRouter = require('./nickname');

const router = express.Router();

router.use('/check', checkRouter);
router.use('/login', loginRouter);
router.use('/signup', signupRouter);
router.use('/nickname', nicknameRouter);
module.exports = router;
