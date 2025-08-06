export const createPayment = async (date, amount, listSales) => {
    // Insert the payment into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert the payment
        const [result] = await connection.query(
            'INSERT INTO payments (date, total_paid) VALUES (?, ?)',
            [date, amount]
        );

        const paymentID = result.insertId;

        // Insert each sale in the list
        for (const sale of listSales) {
            await connection.query(
                'INSERT INTO invoice_payments (sale_id, payment_id, paid) VALUES (?, ?, ?)',
                [paymentID, sale.saleID, sale.totalPaid]
            );
        } 

        await connection.commit();
        return { message: 'Payment created successfully', paymentID };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};