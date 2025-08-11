import { pool } from "../DB/connection.js";

export const getQuoteSupplier = async (filters = {}, limit = 10, page = 1) => {
    const offset = (page - 1) * limit;
    const condittions = [];
    const values = [];

    if (filters.id) {
        condittions.push('q.quote_id = ?');
        values.push(filters.id);
    }
    if (filters.date.start && filters.date.end) {
        condittions.push('q.date BETWEEN ? AND ?');
        values.push(filters.date.start, filters.date.end);
    }
    if (filters.supplier) {
        condittions.push('s.name LIKE ?');
        values.push(`%${filters.supplier}%`);
    }

    const whereClause = condittions.length > 0 ? 'WHERE ' + condittions.join(' AND ') : '';
    
    const [quotes]= await pool.query(
        `SELECT q.quote_id, q.date, s.name as supplier, q.attached_quote
        FROM supplier_quotes q
        JOIN suppliers s ON q.supplier_id = s.UniqueID
        ${whereClause} LIMIT ? OFFSET ?`, 
        [...values, limit, offset]
    );

    // Get total count of products for pagination
    const [[{total}]] = await pool.query(
        `SELECT COUNT(*) as total 
        FROM supplier_quotes q 
        INNER JOIN suppliers s ON q.supplier_id = s.UniqueID 
        ${whereClause}`, 
        values
    );

    return { quotes, total };
};

export const getQuoteSupplierByID = async (id) => {
    // Get a specific quote by ID
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [quote] = await connection.query(
            `SELECT q.quote_id, q.date, s.nit as supplierID, s.name as supplier, q.attached_quote
            FROM supplier_quotes q
            JOIN suppliers s ON q.supplier_id = s.UniqueID
            WHERE q.quote_id = ?`, 
            [id]
        );

        const [quotes] = await connection.query(
            `SELECT p.name as product, pp.quantity, pp.brand, pp.description, pp.price
            FROM purchase_prices pp
            INNER JOIN products p ON pp.product_id = p.UniqueID
            WHERE pp.quote_id = ?`, 
            [id]
        );
        await connection.commit();
        return { quote: quote[0], quotes };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const createQuoteSupplier = async ({id, date, supplierID, attached, products}) => {
    // Insert the product into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO supplier_quotes (quote_id, date, supplier_id, attached_quote) VALUES (?, ?, ?, ?)',
            [id, date, supplierID, attached]
        );

        const quoteID = result.insertId;
        
        for (const product of products) {
            await connection.query(
                'INSERT INTO purchase_prices (quote_id, product_id, quantity, brand, description, price) VALUES (?, ?, ?, ?, ?, ?)',
                [quoteID, product.productID, product.quantity, product.brand, product.description, product.price]
            );
        } 

        await connection.commit();
        return { message: 'Quote created successfully', quoteID };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const updateQuoteSupplier = async (id, generalDates, products) => {
    // Update the product in the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE supplier_quotes SET date = ?, supplier_id = ?, attached_quote = ? WHERE quote_id = ?',
            [generalDates.date, generalDates.supplierID, generalDates.attached, id]
        );

        // Delete existing products for this quote
        await connection.query('DELETE FROM purchase_prices WHERE quote_id = ?', [id]);

        // Insert updated products
        for (const product of products) {
            await connection.query(
                'INSERT INTO purchase_prices (quote_id, product_id, quantity, brand, description, price) VALUES (?, ?, ?, ?, ?, ?)',
                [id, product.productID, product.quantity, product.brand, product.description, product.price]
            );
        }

        await connection.commit();
        return { message: 'Quote updated successfully' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const deleteQuoteSupplier = async (ID) => {
    // Delete the product from the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [resultDetail] = await connection.query(
            'DELETE FROM purchase_prices WHERE quote_id = ?',
            [ID]
        )

        const [result] = await connection.query(
            'DELETE FROM supplier_quotes WHERE quote_id = ?',
            [ID]
        );
        
        await connection.commit();
        return result.affectedRows > 0;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
