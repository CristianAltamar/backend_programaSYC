import { createInvoiceClient, getInvoiceClient, getInvoiceClientByID, updateInvoiceClient, deleteInvoiceClient } from "../models/invoicesClients.model.js";

export const createInvoicesClients = async (req, res) => {
    const { date, delivery, attached, products } = req.body;

    const id = Number(req.body.id) || null;
    const clientID = Number(req.body.clientID) || null;

    if (!clientID || !id || !date || !products || products.length === 0 || products.some(p => !p.productId || !p.quantity || p.invoiceSupplierID || p.und || !p.price || p.quantity < 0 || p.price < 1) || !delivery || !attached) {
        return res.status(400).json({ error: 'Missing required fields or invalid data' });
    }

    try {
        const result = await createInvoiceClient({ id, date, clientID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating invoice' });
    }
}

export const getInvoicesClients = async (req, res) => {
    const { client, paymentStatus, dateStart, dateEnd, expirationDateStart, expirationDateEnd } = req.query;

    const id = Number(req.query.id) || null;
    const orderID = Number(req.query.orderID) || null;

    const date = { start: dateStart, end: dateEnd };
    const expiredDate = { start: expirationDateStart, end: expirationDateEnd };

    const filters = { id, orderID, client, paymentStatus, date, expiredDate };

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    try {
        const { invoices, total } = await getInvoiceClient(filters, limit, page);
        res.status(200).json({ invoices, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoices' });
    }
}

export const getInvoicesClientsByID = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Invoice not found' });

    try {
        const invoice = await getInvoiceClientByID(id);
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoice by ID' });
    }
}

export const updateInvoicesClients = async (req, res) => {
    const id = Number(req.params.id) || null;
    const { date, clientID, delivery, attached, products } = req.body;

    if (!id || id < 1) res.status(400).json({ error: 'Invoice not found' });

    try {
        await updateInvoiceClient(id, { date, clientID, delivery, attached, products });
        res.status(200).json({ message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating invoice' });
    }
}

export const deleteInvoicesClients = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Invoice not found' });

    try {
        await deleteInvoiceClient(id);
        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451 || error.errno === 1217) {
            res.status(400).json({ error: 'Cannot delete invoice, it is referenced by other records' });
        }
        res.status(500).json({ error: 'Error deleting invoice' });
    }
}