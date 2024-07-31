const { Router } = require('express');
const orderController = require('../controllers/order.controller');

const orderRouter = Router();

orderRouter.post('/novo', orderController.addNewOrder);
orderRouter.get('/encontrarpor/todos', orderController.findAllOrders);
orderRouter.get('/encontrarpor/pendente', orderController.findAllPendingOrders);
orderRouter.get('/encontrarpor/:id', orderController.findOrderByID);
orderRouter.get('/encontrarpor/', orderController.findPerStatus);
orderRouter.put('/atualizar/:id', orderController.updateOrder);
orderRouter.delete('/deletar/:id', orderController.deleteOrderByID);

module.exports = orderRouter;
