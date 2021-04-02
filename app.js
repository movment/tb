require('dotenv').config();
const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require('path');
const hpp = require('hpp');
const helmet = require('helmet');
const { sequelize } = require('./models');
const passportConfig = require('./passport');
const rootRouter = require('./routes');

const app = express();
sequelize.sync().then(() => {
  // eslint-disable-next-line no-console
  console.log('DB 연결');
});
if (process.env.NODE_ENV === 'production') {
  app.use(logger('combined'));
  app.use(hpp());
  app.use(helmet());
} else {
  app.use(logger('dev'));
}
passportConfig();
app.use(passport.initialize());
app.use(cookieParser());

app.use(
  cors({
    origin: ['https://doinki.com'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'uploads')));

app.use('/api', rootRouter);

app.listen(5000, () => {
  // eslint-disable-next-line no-console
  console.log('서버 실행 중');
});
