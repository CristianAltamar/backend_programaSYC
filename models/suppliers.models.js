import { pool } from "../DB/connection.js";

export const getSupplier = async (filters = {}, limit = 10, page = 1) => {
    const offset = (page - 1) * limit;
    const condittions = [];
    const values = [];

    if (filters.name) {
        condittions.push('name LIKE ?');
        values.push(`%${filters.name}%`);
    }
    if (filters.id) {
        condittions.push('UniqueID = ?');
        values.push(filters.id);
    }
    if (filters.nit) {
        condittions.push('nit = ?');
        values.push(`%${filters.nit}%`);
    }
    if (filters.contact) {
        condittions.push('contact LIKE ?');
        values.push(`%${filters.contact}%`);
    }
    if (filters.address) {
        condittions.push('address LIKE ?');
        values.push(`%${filters.address}%`);
    }
    if (filters.phone) {
        condittions.push('phone = ?');
        values.push(`%${filters.phone}%`);
    }

    const whereClause = condittions.length > 0 ? 'WHERE ' + condittions.join(' AND ') : '';
    
    const [suppliers]= await pool.query(
        `SELECT * FROM suppliers ${whereClause} LIMIT ? OFFSET ?`, 
        [...values, limit, offset]
    );

    // Get total count of products for pagination
    const [[{total}]] = await pool.query(
        `SELECT COUNT(*) as total FROM suppliers ${whereClause}`, 
        values
    );

    return { suppliers, total };
};

export const createSupplier = async ({name, nit, contact, address, phone}) => {
    // Insert the product into the database
    const [result] = await pool.query(
        'INSERT INTO suppliers (name, nit, contact, address, phone) VALUES (?, ?, ?, ?, ?)',
        [name, nit, contact, address, phone]
    );

    return  result.insertId ;
    
};

export const updateSupplier = async (productID, {name, nit, contact, address, phone}) => {
    // Update the product in the database
    const [result] = await pool.query(
        'UPDATE suppliers SET name = ?, nit = ?, contact = ?, address = ?, phone = ? WHERE UniqueID = ?',
        [name, nit, contact, address, phone, productID]
    );

    return result.affectedRows > 0;
};

export const deleteSupplier = async (productID) => {
    // Delete the product from the database
    const [result] = await pool.query(
        'DELETE FROM suppliers WHERE UniqueID = ?',
        [productID]
    );

    return result.affectedRows > 0;
}