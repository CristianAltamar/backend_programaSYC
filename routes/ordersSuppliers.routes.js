import express from 'express';
const router = express.Router();
import { createOrdersSuppliers, getOrdersSuppliers, getOrdersSuppliersByID, updateOrdersSuppliers, deleteOrdersSuppliers } from '../controllers/ordersSuppliers.controller.js';

router.post('/', createOrdersSuppliers);
router.get('/', getOrdersSuppliers);
router.get('/:id', getOrdersSuppliersByID);
router.put('/:id', updateOrdersSuppliers);
router.delete('/:id', deleteOrdersSuppliers);

export default router;