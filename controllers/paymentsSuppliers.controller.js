import { createPaymentSupplier, getPaymentSupplier, deletePaymentSupplier } from "../models/paymentsSuppliers.model.js";

export const createPaymentsSuppliers = async (req, res) => {
    const { id, date, supplierID, amount, attached } = req.body;
    try {
        const result = await createPaymentSupplier({ id, date, supplierID, amount, attached });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating payment' });
    }
}

export const getPaymentsSuppliers = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { payments, total } = await getPaymentSupplier(JSON.parse(filters), limit, page);
        res.status(200).json({ payments, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching payments' });
    }
}

export const deletePaymentsSuppliers = async (req, res) => {
    const { id } = req.params;
    try {
        await deletePaymentSupplier(id);
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting payment' });
    }
}