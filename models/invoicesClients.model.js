import { pool } from "../../../db";

export const createSale = async (date, purchaseID, expirationDate, listProducts) => {
    // Insert the sale into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert the sale
        const [result] = await connection.query(
            'INSERT INTO sales (date, purchase_order_id, expiration_date, payment_status) VALUES (?, ?, ?, ?)',
            [date, purchaseID, expirationDate, "unpaid"]
        );

        const saleID = result.insertId;

        // Insert each product in the list
        for (const product of listProducts) {
            await connection.query(
                'INSERT INTO sale_invoice_products (sale_id, product_id, purchase_id, und, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
                [saleID, product.productID, product.purchaseID, product.und, product.quantity, product.price]
            );
        }

        await connection.commit();
        return { message: 'Sale created successfully', saleID };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};