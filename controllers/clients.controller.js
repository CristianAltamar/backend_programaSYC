import { createClient, updateclient, getClient, deleteClient } from "../models/clients.model.js";

export const createClients = async (req, res) => {
    const { name, nit, contact, address, phone } = req.body;
    try {
        const clientID = await createClient({ name, nit, contact, address, phone });
        res.status(201).json({ message: 'Client created successfully', clientID });
    } catch (error) {
        res.status(500).json({ error: 'Error creating client' });
    }
}

export const getClients = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { clients, total } = await getClient(JSON.parse(filters), limit, page);
        res.status(200).json({ clients, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching clients' });
    }
}

export const updateClients = async (req, res) => {
    const { id } = req.params;
    const { name, nit, contact, address, phone } = req.body;
    try {
        await updateclient(id, { name, nit, contact, address, phone });
        res.status(200).json({ message: 'Client updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating client' });
    }
}

export const deleteClients = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteClient(id);
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting client' });
    }
}