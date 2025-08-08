import { createQuoteSupplier, getQuoteSupplier, getQuoteSupplierByID, updateQuoteSupplier, deleteQuoteSupplier } from "../models/quotesSuppliers.model.js";

export const createQuotesSuppliers = async (req, res) => {
    const { id, date, supplierID, delivery, attached, products } = req.body;
    try {
        const result = await createQuoteSupplier({ id, date, supplierID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating quote' });
    }
}

export const getQuotesSuppliers = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { quotes, total } = await getQuoteSupplier(JSON.parse(filters), limit, page);
        res.status(200).json({ quotes, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quotes' });
    }
}

export const getQuotesSuppliersByID = async (req, res) => {
    const { id } = req.params;
    try {
        const quote = await getQuoteSupplierByID(id);
        res.status(200).json(quote);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quote by ID' });
    }
}

export const updateQuotesSuppliers = async (req, res) => {
    const { id } = req.params;
    const { date, supplierID, delivery, attached, products } = req.body;
    try {
        await updateQuoteSupplier(id, { date, supplierID, delivery, attached, products });
        res.status(200).json({ message: 'Quote updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating quote' });
    }
}

export const deleteQuotesSuppliers = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteQuoteSupplier(id);
        res.status(200).json({ message: 'Quote deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting quote' });
    }
}