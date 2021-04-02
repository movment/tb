const passport = require('passport');
const { Strategy } = require('passport-jwt');
const { User } = require('../models');

const cookieExtractor = (req) => req.cookies?.token;

module.exports = () => {
  passport.use(
    'jwt',
    new Strategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_KEY,
      },
      async (jwt, done) => {
        try {
          const user = await User.findOne({
            where: { id: jwt.id },
            attributes: ['id', 'nickname'],
          });

          if (user) {
            done(null, user);
            return;
          }

          done(null, false, { reason: 'Unauthorized' });
        } catch (error) {
          done(error);
        }
      },
    ),
  );
};
