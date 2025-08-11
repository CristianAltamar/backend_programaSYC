import { pool } from "../DB/connection.js";

export const getPaymentClient = async (filters = {}, limit = 10, page = 1) => {
    const offset = (page - 1) * limit;
    const condittions = [];
    const values = [];

    if (filters.id) {
        condittions.push('p.UniqueID = ?');
        values.push(filters.id);
    }
    if (filters.date.start && filters.date.end) {
        condittions.push('p.date BETWEEN ? AND ?');
        values.push(filters.date.start, filters.date.end);
    }
    if (filters.amount) {
        condittions.push('p.total_paid = ?');
        values.push(filters.amount);
    }
    if (filters.saleID) {
        condittions.push('ip.sale_id = ?');
        values.push(filters.saleID);
    }
    if (filters.client) {
        condittions.push('c.name LIKE ?');
        values.push(`%${filters.client}%`);
    }

    const whereClause = condittions.length > 0 ? 'WHERE ' + condittions.join(' AND ') : '';
    
    const [payments]= await pool.query(
        `SELECT p.UniqueID as id, p.date, c.name as client, ip.sale_id, ip.paid, p.voucher
        FROM payments p
        JOIN invoice_payments ip ON ip.payment_id = p.UniqueID
        JOIN sales s ON ip.sale_id = s.sale_id
        JOIN clients c ON s.client_id = c.UniqueID
        ${whereClause} LIMIT ? OFFSET ?`,
        [...values, limit, offset]
    );

    // Get total count of products for pagination
    const [[{total}]] = await pool.query(
        `SELECT COUNT(*) as total 
        FROM payments p
        JOIN invoice_payments ip ON ip.payment_id = p.UniqueID
        JOIN sales s ON ip.sale_id = s.sale_id
        JOIN clients c ON s.client_id = c.UniqueID
        ${whereClause}`, 
        values
    );

    return { payments, total };
};

export const createPaymentClient = async ({date, amount, sales, voucher }) => {
    // Insert the product into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO payments (date, total_paid, voucher) VALUES (?, ?, ?)',
            [ date, amount, voucher ]
        );

        const invoiceID = result.insertId;
        
        for (const sale of sales) {
            await connection.query(
                'INSERT INTO invoice_payments (sale_id, payment_id, paid) VALUES (?, ?, ?)',
                [sale.saleID, invoiceID, sale.paid]
            );

            const [[{n}]] = await connection.query(
                'SELECT number_payment as n FROM sales WHERE sale_id = ?',
                [sale.saleID]
            );

            await connection.query(
                'UPDATE sales SET payment_status = ?, number_payment = ? WHERE sale_id = ?',
                [sale.paymentStatus, n + 1, sale.saleID]
            );
        } 

        await connection.commit();
        return { message: 'Order created successfully', invoiceID };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const deletePaymentClient = async (ID) => {
    // Delete the product from the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [invoices] = await connection.query(
            'SELECT sale_id FROM invoice_payments WHERE payment_id = ?',
            [ID]
        );

        for (const invoice of invoices) {
            const [[{n}]] = await connection.query(
                'SELECT number_payment as n FROM sales WHERE sale_id = ?',
                [invoice.sale_id]
            );

            await connection.query(
                'UPDATE sales SET payment_status = ?, number_payment = ? WHERE sale_id = ?',
                [n - 1 > 0 ? "partial" : "unpaid", n - 1, invoice.sale_id]
            );
        }

        await connection.query(
            'DELETE FROM invoice_payments WHERE payment_id = ?',
            [ID]
        )

        const [result] = await connection.query(
            'DELETE FROM payments WHERE UniqueID = ?',
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
};