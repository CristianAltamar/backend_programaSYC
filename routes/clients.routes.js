import express from 'express';
const router = express.Router();
import { getClients, createClients, updateClients, deleteClients } from '../controllers/clients.controller.js';

router.post('/', createClients);
router.get('/', getClients);
router.put('/:id', updateClients);
router.delete('/:id', deleteClients);

export default router;