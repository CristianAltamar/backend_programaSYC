import { pool } from "../DB/connection.js";

export const getQuoteClient = async (filters = {}, limit = 10, page = 1) => {
    const offset = (page - 1) * limit;
    const condittions = [];
    const values = [];

    if (filters.id) {
        condittions.push('q.UniqueID = ?');
        values.push(filters.id);
    }
    if (filters.date.start && filters.date.end) {
        condittions.push('q.date BETWEEN ? AND ?');
        values.push(filters.date.start, filters.date.end);
    }
    if (filters.client) {
        condittions.push('c.name LIKE ?');
        values.push(`%${filters.client}%`);
    }

    const whereClause = condittions.length > 0 ? 'WHERE ' + condittions.join(' AND ') : '';

    const [quotes]= await pool.query(
        `SELECT q.UniqueID, q.date, c.name as client, q.attached_quote
        FROM quotes q
        JOIN clients c ON q.client_id = c.UniqueID
        ${whereClause} LIMIT ? OFFSET ?`, 
        [...values, limit, offset]
    );

    // Get total count of products for pagination
    const [[{total}]] = await pool.query(
        `SELECT COUNT(*) as total 
        FROM quotes q 
        INNER JOIN clients c ON q.client_id = c.UniqueID 
        ${whereClause}`, 
        values
    );

    return { quotes, total };
};

export const getQuoteClientByID = async (id) => {
    // Get a specific quote by ID
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [quote] = await connection.query(
            `SELECT q.UniqueID, q.date, c.nit as clientID, c.name as client, q.attached_quote
            FROM quotes q
            JOIN clients c ON q.client_id = c.UniqueID
            WHERE q.UniqueID = ?`, 
            [id]
        );

        const [products] = await connection.query(
            `SELECT p.name as product, qp.und, qp.quantity, qp.reference_price, qp.increment, qp.sale_price
            FROM quote_prices qp
            INNER JOIN products p ON qp.product_id = p.UniqueID
            WHERE qp.quote_id = ?`, 
            [id]
        );
        await connection.commit();
        return { quote: quote[0], products };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const createQuoteClient = async ({id, date, clientID, delivery, attached, products}) => {
    // Insert the product into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO quotes (UniqueID, date, client_id, delivery, attached_quote) VALUES (?, ?, ?, ?, ?)',
            [id, date, clientID, delivery, attached]
        );

        const quoteID = result.insertId;
        
        for (const product of products) {
            await connection.query(
                'INSERT INTO quote_prices (quote_id, product_id, und, quantity, reference_price, increment, sale_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [quoteID, product.productID, product.und, product.quantity, product.referencePrice, product.increment, product.price]
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

export const updateQuoteClient = async (id, generalDates, products) => {
    // Update the product in the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE quotes SET date = ?, client_id = ?, delivery=?, attached_quote = ? WHERE UniqueID = ?',
            [generalDates.date, generalDates.clientID, generalDates.delivery, generalDates.attached, id]
        );

        // Delete existing products for this quote
        await connection.query('DELETE FROM quote_prices WHERE quote_id = ?', [id]);

        // Insert updated products
        for (const product of products) {
            await connection.query(
                'INSERT INTO quote_prices (quote_id, product_id, und, quantity, reference_price, increment, sale_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, product.productID, product.und, product.quantity, product.reference_price, product.increment, product.salePrice]
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

export const deleteQuoteClient = async (ID) => {
    // Delete the product from the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const [resultDetail] = await connection.query(
            'DELETE FROM quote_prices WHERE quote_id = ?',
            [ID]
        )

        const [result] = await connection.query(
            'DELETE FROM quotes WHERE UniqueID = ?',
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