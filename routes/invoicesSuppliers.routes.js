import express from 'express';
const router = express.Router();
import { createInvoicesSuppliers, getInvoicesSuppliers, getInvoicesSuppliersByID, updateInvoicesSuppliers, deleteInvoicesSuppliers} from '../controllers/invoicesSuppliers.controller.js';

router.post('/', createInvoicesSuppliers);
router.get('/', getInvoicesSuppliers);
router.get('/:id', getInvoicesSuppliersByID);
router.put('/:id', updateInvoicesSuppliers);
router.delete('/:id', deleteInvoicesSuppliers);

export default router;