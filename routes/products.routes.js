import express from 'express';
const router = express.Router();
import {  createProducts, getProductsController, updateProducts, deleteProducts } from '../controllers/products.controller.js';

router.post('/', createProducts);
router.get('/', getProductsController);
router.put('/:id', updateProducts);
router.delete('/:id', deleteProducts);
export default router;