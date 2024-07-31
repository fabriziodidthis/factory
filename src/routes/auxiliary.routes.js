const { Router } = require('express');

const auxiliaryRouter = Router();
const auxiliaryController = require('../controllers/auxiliary.controller');

auxiliaryRouter.get('/health', auxiliaryController.appHealth);

module.exports = auxiliaryRouter;
