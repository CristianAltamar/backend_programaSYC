import express from 'express';
const router = express.Router();
import { createQuotesClients, getQuotesClients, getQuotesClientsByID, updateQuotesClients, deleteQuotesClients } from '../controllers/quotesClients.controllers.js';

router.post('/', createQuotesClients);
router.get('/', getQuotesClients);
router.get('/:id', getQuotesClientsByID);
router.put('/:id', updateQuotesClients);
router.delete('/:id', deleteQuotesClients);

export default router;