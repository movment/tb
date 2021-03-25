// 수정
exports.isNotLoggedIn = (req, res, next) => {
  if (req.headers.authorization) res.status(401).send('Unauthorized');
  else next();
};
