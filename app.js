require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const logger = require('morgan');
const passport = require('passport');
const path = require('path');
const { sequelize } = require('./models');
const passportConfig = require('./passport');
const rootRouter = require('./routes');

sequelize.sync().then(() => {
  // eslint-disable-next-line no-console
  console.log('DB 연결');
});

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.use(logger('combined'));
  app.use(hpp());
  app.use(helmet());
} else {
  app.use(logger('dev'));
}

passportConfig();
app.use(passport.initialize());
app.use(
  cors({
    origin: ['https://doinki.com'],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'uploads')));
app.use('/api', rootRouter);

app.listen(5000, () => {
  // eslint-disable-next-line no-console
  console.log('서버 실행 중');
});
