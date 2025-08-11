import { pool } from "../DB/connection.js";

export const getPaymentSupplier = async (filters = {}, limit = 10, page = 1) => {
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
    if (filters.invoiceID) {
        condittions.push('ip.invoice_id = ?');
        values.push(filters.invoiceID);
    }
    if (filters.supplier) {
        condittions.push('s.name LIKE ?');
        values.push(`%${filters.supplier}%`);
    }

    const whereClause = condittions.length > 0 ? 'WHERE ' + condittions.join(' AND ') : '';
    
    const [payments]= await pool.query(
        `SELECT p.UniqueID as id, p.date, s.name as supplier, ip.invoice_id, ip.amount, p.voucher
        FROM supplier_payments p
        JOIN purchase_invoice_payments ip ON ip.payment_id = p.UniqueID
        JOIN purchase_invoice pi ON ip.invoice_id = pi.UniqueID
        JOIN suppliers s ON pi.supplier_id = s.UniqueID
        ${whereClause} LIMIT ? OFFSET ?`,
        [...values, limit, offset]
    );

    // Get total count of products for pagination
    const [[{total}]] = await pool.query(
        `SELECT COUNT(*) as total 
        FROM supplier_payments p
        JOIN purchase_invoice_payments ip ON ip.payment_id = p.UniqueID
        JOIN purchase_invoice pi ON ip.invoice_id = pi.UniqueID
        JOIN suppliers s ON pi.supplier_id = s.UniqueID
        ${whereClause}`, 
        values
    );

    return { payments, total };
};

export const createPaymentSupplier = async ({date, amount, invoices, voucher }) => {
    // Insert the product into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO supplier_payments (date, total_paid, voucher) VALUES (?, ?, ?)',
            [ date, amount, voucher ]
        );

        const paymentID = result.insertId;
        
        for (const invoice of invoices) {
            await connection.query(
                'INSERT INTO purchase_invoice_payments (invoice_id, payment_id, amount) VALUES (?, ?, ?)',
                [invoice.invoiceID, paymentID, invoice.paid]
            );

            const [[{n}]] = await connection.query(
                'SELECT n_payment as n FROM purchase_invoice WHERE UniqueID = ?',
                [invoice.invoiceID]
            );

            await connection.query(
                'UPDATE purchase_invoice SET payment_status = ?, n_payment = ? WHERE UniqueID = ?',
                [invoice.paymentStatus, n + 1, invoice.invoiceID]
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

export const deletePaymentSupplier = async (ID) => {
    // Delete the product from the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [invoices] = await connection.query(
            'SELECT invoice_id FROM purchase_invoice_payments WHERE payment_id = ?',
            [ID]
        );

        for (const invoice of invoices) {
            const [[{n}]] = await connection.query(
                'SELECT n_payment as n FROM purchase_invoice WHERE UniqueID = ?',
                [invoice.invoice_id]
            );

            await connection.query(
                'UPDATE purchase_invoice SET payment_status = ?, n_payment = ? WHERE UniqueID = ?',
                [n - 1 > 0 ? "partial" : "unpaid", n - 1, invoice.invoice_id]
            );
        }

        await connection.query(
            'DELETE FROM purchase_invoice_payments WHERE payment_id = ?',
            [ID]
        )

        const [result] = await connection.query(
            'DELETE FROM supplier_payments WHERE UniqueID = ?',
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

