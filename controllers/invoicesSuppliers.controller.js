import {createInvoiceSupplier, getInvoiceSupplier, getInvoiceSupplierByID, updateInvoiceSupplier, deleteInvoiceSupplier} from '../models/invoicesSuppliers.model.js';

export const createInvoicesSuppliers = async (req, res) => {
    const { date, delivery, attached, products } = req.body;

    const id = Number(req.body.id) || null;
    const supplierID = Number(req.body.supplierID) || null;

    if (!supplierID || !id || !date || !products || products.length === 0 || products.some(p => !p.productID || p.und || !p.quantity || !p.price || p.quantity < 0 || p.price < 1)) {
        return res.status(400).json({ error: 'Missing required fields or invalid data' });
    }

    try {
        const result = await createInvoiceSupplier({ id, date, supplierID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating invoice' });
    }
}

export const getInvoicesSuppliers = async (req, res) => {
    const { dateStart, dateEnd, supplier, expirationDateStart, expirationDateEnd, paymentStatus } = req.query;

    const id = Number(req.query.id) || null;
    const quoteID = Number(req.query.quoteID) || null;

    const date = { start: dateStart, end: dateEnd };
    const expiredDate = { start: expirationDateStart, end: expirationDateEnd };

    const filters = { id, date, quoteID, supplier, expiredDate, paymentStatus };

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    try {
        const { invoices, total } = await getInvoiceSupplier(filters, limit, page);
        res.status(200).json({ invoices, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoices' });
    }
}   

export const getInvoicesSuppliersByID = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Invoice not found' });

    try {
        const invoice = await getInvoiceSupplierByID(id);
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoice by ID' });
    }
}

export const updateInvoicesSuppliers = async (req, res) => {
    const id = Number(req.params.id) || null;
    const { date, supplierID, delivery, attached, products } = req.body;

    if (!id || id < 1) res.status(400).json({ error: 'Invoice not found' });

    try {
        await updateInvoiceSupplier(id, { date, supplierID, delivery, attached, products });
        res.status(200).json({ message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating invoice' });
    }
}

export const deleteInvoicesSuppliers = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Invoice not found' });

    try {
        await deleteInvoiceSupplier(id);
        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451 || error.errno === 1217) {
            res.status(400).json({ error: 'Cannot delete invoice, it is referenced by other records' });
        }
        res.status(500).json({ error: 'Error deleting invoice' });
    }
}