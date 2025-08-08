import express from 'express';
const router = express.Router();
import { createPaymentsClients, getPaymentsClients, deletePaymentClients } from '../controllers/paymentsClients.controller.js';

router.post('/', createPaymentsClients);
router.get('/', getPaymentsClients);
router.delete('/:id', deletePaymentClients);

export default router;