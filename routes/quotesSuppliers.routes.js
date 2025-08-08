import express from 'express';
const router = express.Router();
import { createQuotesSuppliers, getQuotesSuppliers, getQuotesSuppliersByID, updateQuotesSuppliers, deleteQuotesSuppliers } from '../controllers/quotesSuppliers.controller.js';

router.post('/', createQuotesSuppliers);
router.get('/', getQuotesSuppliers);
router.get('/:id', getQuotesSuppliersByID);
router.put('/:id', updateQuotesSuppliers);
router.delete('/:id', deleteQuotesSuppliers);

export default router;