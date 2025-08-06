import { pool } from "../../../db";

export const createPurchaseOrder = async (date, clientID, quoteID, delivery, listProducts) => {
    // Insert the purchase order into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert the purchase order
        const [result] = await connection.query(
            'INSERT INTO purchase_orders (date, client_id, quote_id, delivery) VALUES (?, ?, ?, ?)',
            [date, clientID, quoteID, delivery]
        );

        const orderID = result.insertId;

        // Insert each product in the list
        for (const product of listProducts) {
            await connection.query(
                'INSERT INTO products_purchase_orders (purchase_order_id, product_id, und, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [orderID, product.productID, product.und, product.quantity, product.price]
            );
        } 

        await connection.commit();
        return { message: 'Purchase order created successfully', orderID };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};