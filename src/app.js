const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const morgan = require('morgan');
const colors = require('colors');

// Swagger
const swaggerUI = require('swagger-ui-express');
const swaggerJSON = require('../swagger/index.json');

const app = express();
colors.enable();

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON));
app.use(cors({ credentials: true, origin: true }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use('/', routes);

module.exports = app;
