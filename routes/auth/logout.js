const express = require('express');

const router = express.Router();

router.post('/', (req, res) => {
  res.clearCookie('token');
  res.status(204).end();
});

module.exports = router;
