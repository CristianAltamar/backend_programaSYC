import { createOrderClient, getOrderClient, getOrderClientByID, updateOrderClient, deleteOrderClient } from "../models/ordersClients.model.js";

export const createOrdersClients = async (req, res) => {
    const { date, delivery, attached, products } = req.body;

    const id = Number(req.body.id) || null;
    const clientID = Number(req.body.clientID) || null;

    if (!clientID || !id || !date || !products || products.length === 0 || products.some(p => !p.productID || !p.quantity || !p.und || !p.price || p.quantity < 0 || p.price < 1) || !delivery || !attached) {
        return res.status(400).json({ error: 'Missing required fields or invalid data' });
    }

    try {
        const result = await createOrderClient({ id, date, clientID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating order' });
    }
}

export const getOrdersClients = async (req, res) => {
    const { dateStart, dateEnd, client } = req.query;

    const id = Number(req.query.id) || null;
    const quoteID = Number(req.query.quoteID) || null;

    const date = { start: dateStart, end: dateEnd };
    const filters = { id, date, quoteID, client };

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    try {
        const { orders, total } = await getOrderClient(filters, limit, page);
        res.status(200).json({ orders, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
}

export const getOrdersClientsByID = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Order not found' });

    try {
        const order = await getOrderClientByID(id);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching order by ID' });
    }
}

export const updateOrdersClients = async (req, res) => {
    const id = Number(req.params.id) || null;
    const { date, clientID, delivery, attached, products } = req.body;

    if (!id || id < 1) res.status(400).json({ error: 'Order not found' });

    try {
        await updateOrderClient(id, { date, clientID, delivery, attached, products });
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating order' });
    }
}

export const deleteOrdersClients = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Order not found' });

    try {
        await deleteOrderClient(id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451 || error.errno === 1217) {
            res.status(400).json({ error: 'Cannot delete order, it is referenced by other records' });
        }
        res.status(500).json({ error: 'Error deleting order' });
    }
}