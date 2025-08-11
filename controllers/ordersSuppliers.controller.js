import { createOrderSupplier, getOrderSupplier, getOrderSupplierByID, updateOrderSupplier, deleteOrderSupplier } from '../models/ordersSuppliers.model.js';

export const createOrdersSuppliers = async (req, res) => {
    const { date, delivery, attached, products } = req.body;

    const id = Number(req.body.id) || null;
    const supplierID = Number(req.body.supplierID) || null;

    if (!supplierID || !id || !date || !products || products.length === 0 || products.some(p => !p.productID || !p.und || !p.quantity || !p.price || p.quantity < 0 || p.price < 1) || !delivery || !attached) {
        return res.status(400).json({ error: 'Missing required fields or invalid data' });
    }

    try {
        const result = await createOrderSupplier({ id, date, supplierID, delivery, attached, products });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating order' });
    }
}  

export const getOrdersSuppliers = async (req, res) => {
    const { dateStart, dateEnd, supplier } = req.query;

    const id = Number(req.query.id) || null;
    const quoteID = Number(req.query.quoteID) || null;

    const date = { start: dateStart, end: dateEnd };
    const filters = { id, date, quoteID, supplier };

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    try {
        const { orders, total } = await getOrderSupplier(filters, limit, page);
        res.status(200).json({ orders, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
}

export const getOrdersSuppliersByID = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Order not found' });

    try {
        const order = await getOrderSupplierByID(id);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching order by ID' });
    }
}

export const updateOrdersSuppliers = async (req, res) => {
    const id = Number(req.params.id) || null;
    const { date, supplierID, delivery, attached, products } = req.body;

    if (!id || id < 1) res.status(400).json({ error: 'Order not found' });

    try {
        await updateOrderSupplier(id, { date, supplierID, delivery, attached, products });
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating order' });
    }
}

export const deleteOrdersSuppliers = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Order not found' });

    try {
        await deleteOrderSupplier(id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451 || error.errno === 1217) {
            res.status(400).json({ error: 'Cannot delete order, it is referenced by other records' });
        }
        res.status(500).json({ error: 'Error deleting order' });
    }
}