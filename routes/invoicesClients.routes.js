import express from 'express';
const router = express.Router();
import { createInvoicesClients, getInvoicesClients, getInvoicesClientsByID, updateInvoicesClients, deleteInvoicesClients } from "../controllers/invoicesclients.controller.js"

router.post('/', createInvoicesClients);
router.get('/', getInvoicesClients);
router.get('/:id', getInvoicesClientsByID);
router.put('/:id', updateInvoicesClients);
router.delete('/:id', deleteInvoicesClients);

export default router;