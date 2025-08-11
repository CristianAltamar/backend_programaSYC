import { createClient, updateclient, getClient, deleteClient } from "../models/clients.model.js";

export const createClients = async (req, res) => {
    const { name, contact, address } = req.body;

    const phone = Number(req.body.phone) || null;
    const nit = Number(req.body.nit) || null;

    if (!name || !contact || !address || !nit || !phone) {
        return res.status(400).json({ error: 'Name, contact, and address are required' });
    }

    try {
        const clientID = await createClient({ name, nit, contact, address, phone });
        res.status(201).json({ message: 'Client created successfully', clientID });
    } catch (error) {
        res.status(500).json({ error: 'Error creating client' });
    }
}

export const getClients = async (req, res) => {
    const { name, contact, address } = req.query;

    const id = Number(req.query.id) || null;
    const nit = Number(req.query.nit) || null;
    const phone = Number(req.query.phone) || null;

    const filters = { id, name, nit, contact, address, phone };

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    try {
        const { clients, total } = await getClient(filters, limit, page);
        res.status(200).json({ clients, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching clients'});
    }
}

export const updateClients = async (req, res) => {
    const id = Number(req.params.id) || null;
    const { name, nit, contact, address, phone } = req.body;

    if (!id || id < 1) res.status(400).json({ error: 'Client not found' });

    try {
        await updateclient(id, { name, nit, contact, address, phone });
        res.status(200).json({ message: 'Client updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating client' });
    }
}

export const deleteClients = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Client not found' });

    try {
        await deleteClient(id);
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451 || error.errno === 1217) {
            res.status(400).json({ error: 'Cannot delete client, it is referenced by other records' });
        }
        res.status(500).json({ error: 'Error deleting client' });
    }
}