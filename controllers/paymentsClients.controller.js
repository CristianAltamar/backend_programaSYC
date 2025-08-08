import {createPaymentClient, getPaymentClient, deletePaymentClient} from "../models/paymentsClients.model.js";

export const createPaymentsClients = async (req, res) => {
    const { id, date, clientID, amount, attached } = req.body;
    try {
        const result = await createPaymentClient({ id, date, clientID, amount, attached });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating payment' });
    }
}

export const getPaymentsClients = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { payments, total } = await getPaymentClient(JSON.parse(filters), limit, page);
        res.status(200).json({ payments, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching payments' });
    }
}

export const deletePaymentClients = async (req, res) => {
    const { id } = req.params;
    try {
        await deletePaymentClient(id);
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting payment' });
    }
}
