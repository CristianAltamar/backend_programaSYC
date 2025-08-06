export const createPurchaseInvoice = async (date, quiteID, expirationDate, listProducts) => {
    // Insert the purchase invoice into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert the purchase invoice
        const [result] = await connection.query(
            'INSERT INTO purchase_invoice (date, quote_id, expiration_date, payment_status) VALUES (?, ?, ?, ?)',
            [date, quiteID, expirationDate, "unpaid"]
        );

        const invoiceID = result.insertId;

        // Insert each product in the list
        for (const product of listProducts) {
            await connection.query(
                'INSERT INTO purchase_invoice_products (invoice_id, product_id, und, quantity, brand, description, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [invoiceID, product.productID, product.und, product.quantity, product.brand, product.description, product.price]
            );
        }

        await connection.commit();
        return { message: 'Purchase invoice created successfully', invoiceID };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};