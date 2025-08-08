import { createInvoiceClient, getInvoiceClient, getInvoiceClientByID, updateInvoiceClient, deleteInvoiceClient } from "../models/invoicesClients.model.js";

export const createInvoicesClients = async (req, res) => {
    const { id, date, clientID, delivery, attached, products } = req.body;
    try {
        const result = await createInvoiceClient({ id, date, clientID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating invoice' });
    }
}

export const getInvoicesClients = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { invoices, total } = await getInvoiceClient(JSON.parse(filters), limit, page);
        res.status(200).json({ invoices, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoices' });
    }
}

export const getInvoicesClientsByID = async (req, res) => {
    const { id } = req.params;
    try {
        const invoice = await getInvoiceClientByID(id);
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoice by ID' });
    }
}

export const updateInvoicesClients = async (req, res) => {
    const { id } = req.params;
    const { date, clientID, delivery, attached, products } = req.body;
    try {
        await updateInvoiceClient(id, { date, clientID, delivery, attached, products });
        res.status(200).json({ message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating invoice' });
    }
}

export const deleteInvoicesClients = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteInvoiceClient(id);
        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting invoice' });
    }
}