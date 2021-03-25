const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const { User } = require('../models');

module.exports = () => {
  passport.use(
    'jwt',
    new Strategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_KEY,
      },
      async (jwt, done) => {
        try {
          const user = await User.findOne({
            where: { id: jwt.id },
            attributes: ['id', 'nickname'],
          });

          if (user) done(null, user);
          else done(null, false, { reason: 'Unauthorized' });
        } catch (error) {
          done(error);
        }
      },
    ),
  );
};
