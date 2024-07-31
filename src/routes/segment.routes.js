const { Router } = require('express');
const segmentController = require('../controllers/segment.controller');

const segmentRouter = Router();

segmentRouter.post('/novo', segmentController.addNewSegment);
segmentRouter.get('/encontrarpor/todos/', segmentController.findAllSegments);
segmentRouter.get('/encontrarpor/:id', segmentController.findSegmentByID);
segmentRouter.put('/atualizar/:id', segmentController.updateSegment);
segmentRouter.delete('/deletar/:id', segmentController.deleteSegment);

module.exports = segmentRouter;
