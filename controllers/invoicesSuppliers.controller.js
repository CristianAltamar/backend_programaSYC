import {createInvoiceSupplier, getInvoiceSupplier, getInvoiceSupplierByID, updateInvoiceSupplier, deleteInvoiceSupplier} from '../models/invoicesSuppliers.model.js';

export const createInvoicesSuppliers = async (req, res) => {
    const { id, date, supplierID, delivery, attached, products } = req.body;
    try {
        const result = await createInvoiceSupplier({ id, date, supplierID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating invoice' });
    }
}

export const getInvoicesSuppliers = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { invoices, total } = await getInvoiceSupplier(JSON.parse(filters), limit, page);
        res.status(200).json({ invoices, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoices' });
    }
}   

export const getInvoicesSuppliersByID = async (req, res) => {
    const { id } = req.params;
    try {
        const invoice = await getInvoiceSupplierByID(id);
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoice by ID' });
    }
}

export const updateInvoicesSuppliers = async (req, res) => {
    const { id } = req.params;
    const { date, supplierID, delivery, attached, products } = req.body;
    try {
        await updateInvoiceSupplier(id, { date, supplierID, delivery, attached, products });
        res.status(200).json({ message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating invoice' });
    }
}

export const deleteInvoicesSuppliers = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteInvoiceSupplier(id);
        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting invoice' });
    }
}