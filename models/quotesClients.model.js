import { pool } from "../../../db";

export const createQuoteClient = async (date, clientID, delivery, listProducts) => {
    // Insert the quote into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert the quote
        const [result] = await connection.query(
            'INSERT INTO quotes (date, client_id, delivery) VALUES (?, ?, ?)',
            [date, clientID, delivery]
        );

        const quoteID = result.insertId;

        // Insert each product in the list
        for (const product of listProducts) {
            await connection.query(
                'INSERT INTO quote_prices (quote_id, product_id, und, quantity, reference_price_id, increment, sale_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [quoteID, product.productID,product.und, product.quantity, product.referencePrice, product.increment, product.salePrice]
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