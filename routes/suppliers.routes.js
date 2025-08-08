import express from 'express';
const router = express.Router();
import { createSuppliers, getSuppliers, updateSuppliers, deleteSuppliers } from '../controllers/suppliers.controller.js';

router.post('/', createSuppliers);
router.get('/', getSuppliers);
router.put('/:id', updateSuppliers);
router.delete('/:id', deleteSuppliers);

export default router;