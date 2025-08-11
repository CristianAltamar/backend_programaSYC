import {createPaymentClient, getPaymentClient, deletePaymentClient} from "../models/paymentsClients.model.js";

export const createPaymentsClients = async (req, res) => {
    const { date, amount, attached } = req.body;

    const id = Number(req.body.id) || null;
    const clientID = Number(req.body.clientID) || null;

    if (!clientID || !id || !date || !amount || amount < 0 || !attached) {
        return res.status(400).json({ error: 'Missing required fields or invalid data' });
    }

    try {
        const result = await createPaymentClient({ id, date, clientID, amount, attached });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating payment' });
    }
}

export const getPaymentsClients = async (req, res) => {
    const { dateStart, dateEnd, amount, client } = req.query;

    const id = Number(req.query.id) || null;
    const saleID = Number(req.query.saleID) || null;

    const date = { start: dateStart, end: dateEnd };
    const filters = { id, date, amount, saleID, client };

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    try {
        const { payments, total } = await getPaymentClient(filters, limit, page);
        res.status(200).json({ payments, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching payments' });
    }
}

export const deletePaymentClients = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Payment not found' });

    try {
        await deletePaymentClient(id);
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451 || error.errno === 1217) {
            res.status(400).json({ error: 'Cannot delete payment, it is referenced by other records' });
        }
        res.status(500).json({ error: 'Error deleting payment' });
    }
}
