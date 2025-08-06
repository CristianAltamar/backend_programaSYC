export const createPaymentSupplier = async (date, invoiceID, amount, listPurchaseInvoice) => {
    // Insert the payment to supplier into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert the payment
        const [result] = await connection.query(
            'INSERT INTO supplier_payments (date, total_paid) VALUES (?, ?, ?)',
            [date, invoiceID, amount]
        );

        const paymentID = result.insertId;

        // Insert each product in the list
        for (const product of listPurchaseInvoice) {
            await connection.query(
                'INSERT INTO purchase_invoice_payments (invoice_id, payment_id, amount) VALUES (?, ?, ?)',
                [paymentID, product.paymentID, product.amount]
            );
        }

        await connection.commit();
        return { message: 'Payment to supplier created successfully', paymentID };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};