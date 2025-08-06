import { pool } from "../DB/connection.js";

export const getProducts = async (filters = {}, limit = 10, page = 1) => {
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

    const whereClause = condittions.length > 0 ? 'WHERE ' + condittions.join(' AND ') : '';
    
    const [products]= await pool.query(
        `SELECT * FROM products ${whereClause} LIMIT ? OFFSET ?`, 
        [...values, limit, offset]
    );

    // Get total count of products for pagination
    const [[{total}]] = await pool.query(
        `SELECT COUNT(*) as total FROM products ${whereClause}`, 
        values
    );

    return { products, total };
};

export const createProduct = async ({name}) => {
    // Insert the product into the database
    const [result] = await pool.query(
        'INSERT INTO products (name) VALUES (?)',
        [name]
    );

    return  result.insertId ;
    
};

export const updateProduct = async (productID, {name}) => {
    // Update the product in the database
    const [result] = await pool.query(
        'UPDATE products SET name = ? WHERE UniqueID = ?',
        [name, productID]
    );

    return result.affectedRows > 0;
};

export const deleteProduct = async (productID) => {
    // Delete the product from the database
    const [result] = await pool.query(
        'DELETE FROM products WHERE UniqueID = ?',
        [productID]
    );

    return result.affectedRows > 0;
}

