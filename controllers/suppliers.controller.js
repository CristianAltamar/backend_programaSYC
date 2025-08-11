import { createSupplier, getSupplier, updateSupplier, deleteSupplier } from "../models/suppliers.models.js";

export const createSuppliers = async (req, res) => {
    const { name, contact, address } = req.body;

    const phone = Number(req.body.phone) || null;
    const nit = Number(req.body.nit) || null;

    if (!name || !nit) {
        return res.status(400).json({ error: 'Missing required fields or invalid data' });
    }

    try {
        const supplierID = await createSupplier({ name, nit, contact, address, phone });
        res.status(201).json({ message: 'Supplier created successfully', supplierID });
    } catch (error) {
        res.status(500).json({ error: 'Error creating supplier' });
    }
}

export const getSuppliers = async (req, res) => {
    const { name, contact, address } = req.query;

    const id = Number(req.query.id) || null;
    const nit = Number(req.query.nit) || null;
    const phone = Number(req.query.phone) || null;

    const filters = { name, id, nit, contact, address, phone };
    
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    try {
        const { suppliers, total } = await getSupplier(filters, limit, page);
        res.status(200).json({ suppliers, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching suppliers' });
    }
}

export const updateSuppliers = async (req, res) => {
    const id = Number(req.params.id) || null;
    const { name, nit, contact, address, phone } = req.body;

    if (!id || id < 1) res.status(400).json({ error: 'Supplier not found' });

    try {
        await updateSupplier(id, { name, nit, contact, address, phone });
        res.status(200).json({ message: 'Supplier updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating supplier' });
    }
}

export const deleteSuppliers = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Supplier not found' });
    
    try {
        await deleteSupplier(id);
        res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451 || error.errno === 1217) {
            res.status(400).json({ error: 'Cannot delete supplier, it is referenced by other records' });
        }
        res.status(500).json({ error: 'Error deleting supplier' });
    }
}