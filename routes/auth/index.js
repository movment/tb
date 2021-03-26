const express = require('express');
const checkRouter = require('./check');
const loginRouter = require('./login');
const nicknameRouter = require('./nickname');

const router = express.Router();

router.use('/check', checkRouter);
router.use('/login', loginRouter);
router.use('/nickname', nicknameRouter);
module.exports = router;
