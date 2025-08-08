import express from 'express';
const router = express.Router();
import { createOrdersClients, getOrdersClients, getOrdersClientsByID, updateOrdersClients, deleteOrdersClients } from '../controllers/ordersClients.controller.js';

router.post('/', createOrdersClients);
router.get('/', getOrdersClients);
router.get('/:id', getOrdersClientsByID);
router.put('/:id', updateOrdersClients);
router.delete('/:id', deleteOrdersClients);

export default router;