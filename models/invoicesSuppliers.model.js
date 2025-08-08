import { pool } from "../DB/connection.js";

export const getInvoiceSupplier = async (filters = {}, limit = 10, page = 1) => {
    const offset = (page - 1) * limit;
    const condittions = [];
    const values = [];

    if (filters.id) {
        condittions.push('pi.UniqueID = ?');
        values.push(filters.id);
    }
    if (filters.date) {
        condittions.push('pi.date BETWEEN ? AND ?');
        values.push(filters.date.start, filters.date.end);
    }
    if (filters.quoteID) {
        condittions.push('pi.quote_id = ?');
        values.push(filters.quoteID);
    }
    if (filters.supplier) {
        condittions.push('s.name LIKE ?');
        values.push(`%${filters.supplier}%`);
    }
    if (filters.expiredDate) {
        condittions.push('pi.expired_date BETWEEN ? AND ?');
        values.push(filters.expiredDate.start, filters.expiredDate.end);
    }
    if (filters.paymentStatus) {
        condittions.push("pi.payment_status = ?");
        values.push(filters.paymentStatus)
    }

    const whereClause = condittions.length > 0 ? 'WHERE ' + condittions.join(' AND ') : '';
    
    const [invoices]= await pool.query(
        `SELECT pi.UniqueID as id, pi.date, s.name as supplier, pi.quote_id, pi.expiration_date, pi.payment_status, pi.attached_invoice
        FROM purchase_invoice pi
        JOIN suppliers s ON pi.supplier_id = s.UniqueID
        ${whereClause} LIMIT ? OFFSET ?`, 
        [...values, limit, offset]
    );

    // Get total count of products for pagination
    const [[{total}]] = await pool.query(
        `SELECT COUNT(*) as total 
        FROM purchase_invoice pi 
        INNER JOIN suppliers s ON pi.supplier_id = s.UniqueID 
        ${whereClause}`, 
        values
    );

    return { invoices, total };
};

export const getInvoiceSupplierByID = async (id) => {
    // Get a specific order by ID
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [invoice] = await connection.query(
            `SELECT pi.UniqueID as id, pi.date, s.nit, s.name as supplier, pi.quote_id, pi.expiration_date, pi.payment_status, pi.attached_invoice
            FROM purchase_invoice pi
            JOIN suppliers s ON pi.supplier_id = s.UniqueID
            WHERE s.UniqueID = ?`, 
            [id]
        );

        const [products] = await connection.query(
            `SELECT p.name as product, po.und, po.quantity, po.brand, po.description, po.price
            FROM purchase_invoice_products po
            INNER JOIN products p ON po.product_id = p.UniqueID
            WHERE po.invoice_id = ?`, 
            [id]
        );
        await connection.commit();
        return { invoice, products };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const createInvoiceSupplier = async ({id, date, supplierID, quoteID, expirationDate, paymentStatus, attached, products}) => {
    // Insert the product into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO purchase_invoice (UniqueID, date, supplier_id, quote_id, expiration_date, payment_status, attached_invoice) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, date, supplierID, quoteID, expirationDate, paymentStatus, attached]
        );

        const invoiceID = result.insertId;
        
        for (const product of products) {
            await connection.query(
                'INSERT INTO purchase_invoice_products (invoice_id, product_id, und, quantity, brand, description, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [invoiceID, product.productID, product.und, product.quantity, product.brand, product.description, product.price]
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

export const updateInvoiceSupplier = async (id, generalDates, products) => {
    // Update the product in the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE purchase_invoice SET date = ?, supplier_id = ?, quote_id = ?, expiration_date = ?, payment_status = ?, attached_invoice = ? WHERE UniqueID = ?',
            [generalDates.date, generalDates.supplierID, generalDates.quoteID, generalDates.expirationDate, generalDates.paymentStatus, generalDates.attached, id]
        );

        // Delete existing products for this order
        await connection.query('DELETE FROM purchase_invoice_products WHERE invoice_id = ?', [id]);

        // Insert updated products
        for (const product of products) {
            await connection.query(
                'INSERT INTO purchase_invoice_products (invoice_id, product_id, und, quantity, brand, description, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, product.productID, product.und, product.quantity, product.brand, product.description, product.price]
            );
        }

        await connection.commit();
        return { message: 'Order updated successfully' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const deleteInvoiceSupplier = async (ID) => {
    // Delete the product from the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [resultDetail] = await connection.query(
            'DELETE FROM purchase_invoice_products WHERE invoice_id = ?',
            [ID]
        )

        const [result] = await connection.query(
            'DELETE FROM purchase_invoice WHERE UniqueID = ?',
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