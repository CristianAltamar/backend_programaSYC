import { createQuoteSupplier, getQuoteSupplier, getQuoteSupplierByID, updateQuoteSupplier, deleteQuoteSupplier } from "../models/quotesSuppliers.model.js";

export const createQuotesSuppliers = async (req, res) => {
    const { date, delivery, attached, products } = req.body;

    const id = Number(req.body.id) || null;
    const supplierID = Number(req.body.supplierID) || null;

    if (!supplierID || !id || !date || !products || products.length === 0 || products.some(p => !p.productId || !p.quantity || !p.price || p.quantity < 0 || p.price < 1)) {
        return res.status(400).json({ error: 'Missing required fields or invalid data' });
    }

    try {
        const result = await createQuoteSupplier({ id, date, supplierID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating quote' });
    }
}

export const getQuotesSuppliers = async (req, res) => {
    const { dateStart, dateEnd, supplier } = req.query;

    const id = Number(req.query.id) || null;
    
    const date = { start: dateStart, end: dateEnd };
    const filters = { id, date, supplier };

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    try {
        const { quotes, total } = await getQuoteSupplier(filters, limit, page);
        res.status(200).json({ quotes, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quotes' });
    }
}

export const getQuotesSuppliersByID = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Quote not found' });

    try {
        const quote = await getQuoteSupplierByID(id);
        res.status(200).json(quote);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quote by ID' });
    }
}

export const updateQuotesSuppliers = async (req, res) => {
    const id = Number(req.params.id) || null;
    const { date, supplierID, delivery, attached, products } = req.body;

    if (!id || id < 1) res.status(400).json({ error: 'Quote not found' });

    try {
        await updateQuoteSupplier(id, { date, supplierID, delivery, attached, products });
        res.status(200).json({ message: 'Quote updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating quote' });
    }
}

export const deleteQuotesSuppliers = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Quote not found' });

    try {
        await deleteQuoteSupplier(id);
        res.status(200).json({ message: 'Quote deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451 || error.errno === 1217) {
            res.status(400).json({ error: 'Cannot delete quote, it is referenced by other records' });
        }
        res.status(500).json({ error: 'Error deleting quote' });
    }
}