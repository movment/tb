require('dotenv').config();
const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const passport = require('passport');
const path = require('path');
const { sequelize } = require('./models');
const passportConfig = require('./passport');
const rootRouter = require('./routes');

const app = express();
sequelize.sync().then(() => {
  // eslint-disable-next-line no-console
  console.log('DB 연결');
});

app.use(logger('dev'));
passportConfig();
app.use(passport.initialize());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
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
