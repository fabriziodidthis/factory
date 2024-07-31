const { Router } = require('express');
const reportsController = require('../controllers/reports.controller');

const reportsRouter = Router();

reportsRouter.get('/prontos', reportsController.findDone);

module.exports = reportsRouter;
