import { createOrderClient, getOrderClient, getOrderClientByID, updateOrderClient, deleteOrderClient } from "../models/ordersClients.model.js";

export const createOrdersClients = async (req, res) => {
    const { id, date, clientID, delivery, attached, products } = req.body;
    try {
        const result = await createOrderClient({ id, date, clientID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating order' });
    }
}

export const getOrdersClients = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { orders, total } = await getOrderClient(JSON.parse(filters), limit, page);
        res.status(200).json({ orders, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
}

export const getOrdersClientsByID = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await getOrderClientByID(id);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching order by ID' });
    }
}

export const updateOrdersClients = async (req, res) => {
    const { id } = req.params;
    const { date, clientID, delivery, attached, products } = req.body;
    try {
        await updateOrderClient(id, { date, clientID, delivery, attached, products });
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating order' });
    }
}

export const deleteOrdersClients = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteOrderClient(id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting order' });
    }
}