import { createQuoteClient, getQuoteClient, getQuoteClientByID, updateQuoteClient, deleteQuoteClient } from "../models/quotesClients.model.js";

export const createQuotesClients = async (req, res) => {
    const { id, date, clientID, delivery, attached, products } = req.body;
    try {
        const result = await createQuoteClient({ id, date, clientID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating quote' });
    }
}

export const getQuotesClients = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { quotes, total } = await getQuoteClient(JSON.parse(filters), limit, page);
        res.status(200).json({ quotes, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quotes' });
    }
}

export const getQuotesClientsByID = async (req, res) => {
    const { id } = req.params;
    try {
        const quote = await getQuoteClientByID(id);
        res.status(200).json(quote);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quote by ID' });
    }
}

export const updateQuotesClients = async (req, res) => {
    const { id } = req.params;
    const { date, clientID, delivery, attached, products } = req.body;
    try {
        await updateQuoteClient(id, { date, clientID, delivery, attached, products });
        res.status(200).json({ message: 'Quote updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating quote' });
    }
}

export const deleteQuotesClients = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteQuoteClient(id);
        res.status(200).json({ message: 'Quote deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting quote' });
    }
}