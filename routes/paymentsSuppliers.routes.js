import express  from 'express';
const router = express.Router();
import { createPaymentsSuppliers, getPaymentsSuppliers, deletePaymentsSuppliers } from '../controllers/paymentsSuppliers.controller.js';

router.post('/', createPaymentsSuppliers);
router.get('/', getPaymentsSuppliers);
router.delete('/:id', deletePaymentsSuppliers);

export default router;