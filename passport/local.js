const bcrypt = require('bcrypt');
const passport = require('passport');
const { Strategy } = require('passport-local');
const { User } = require('../models');

module.exports = () => {
  passport.use(
    'local',
    new Strategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({
            where: { email },
            attributes: ['id', 'nickname', 'password'],
          });

          if (!user) done(null, false, { reason: 'Check email' });
          else {
            const result = await bcrypt.compare(password, user.password);

            if (result) done(null, user);
            else
              done(null, false, {
                reason: 'Check password',
              });
          }
        } catch (error) {
          done(error);
        }
      },
    ),
  );
};
