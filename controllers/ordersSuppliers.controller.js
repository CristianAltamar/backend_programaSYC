import { createOrderSupplier, getOrderSupplier, getOrderSupplierByID, updateOrderSupplier, deleteOrderSupplier } from '../models/ordersSuppliers.model.js';

export const createOrdersSuppliers = async (req, res) => {
    const { id, date, supplierID, delivery, attached, products } = req.body;
    try {
        const result = await createOrderSupplier({ id, date, supplierID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating order' });
    }
}  

export const getOrdersSuppliers = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { orders, total } = await getOrderSupplier(JSON.parse(filters), limit, page);
        res.status(200).json({ orders, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
}

export const getOrdersSuppliersByID = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await getOrderSupplierByID(id);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching order by ID' });
    }
}

export const updateOrdersSuppliers = async (req, res) => {
    const { id } = req.params;
    const { date, supplierID, delivery, attached, products } = req.body;
    try {
        await updateOrderSupplier(id, { date, supplierID, delivery, attached, products });
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating order' });
    }
}

export const deleteOrdersSuppliers = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteOrderSupplier(id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting order' });
    }
}