import { createSupplier, getSupplier, updateSupplier, deleteSupplier } from "../models/suppliers.models.js";

export const createSuppliers = async (req, res) => {
    const { name, nit, contact, address, phone } = req.body;
    try {
        const supplierID = await createSupplier({ name, nit, contact, address, phone });
        res.status(201).json({ message: 'Supplier created successfully', supplierID });
    } catch (error) {
        res.status(500).json({ error: 'Error creating supplier' });
    }
}

export const getSuppliers = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { suppliers, total } = await getSupplier(JSON.parse(filters), limit, page);
        res.status(200).json({ suppliers, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching suppliers' });
    }
}

export const updateSuppliers = async (req, res) => {
    const { id } = req.params;
    const { name, nit, contact, address, phone } = req.body;
    try {
        await updateSupplier(id, { name, nit, contact, address, phone });
        res.status(200).json({ message: 'Supplier updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating supplier' });
    }
}

export const deleteSuppliers = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteSupplier(id);
        res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting supplier' });
    }
}