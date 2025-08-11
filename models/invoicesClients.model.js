import { pool } from "../DB/connection.js";

export const getInvoiceClient = async (filters = {}, limit = 10, page = 1) => {
    const offset = (page - 1) * limit;
    const condittions = [];
    const values = [];

    if (filters.id) {
        condittions.push('s.sale_id = ?');
        values.push(filters.id);
    }
    if (filters.date.start && filters.date.end) {
        condittions.push('s.date BETWEEN ? AND ?');
        values.push(filters.date.start, filters.date.end);
    }
    if (filters.orderID) {
        condittions.push('s.purchase_order_id = ?');
        values.push(filters.orderID);
    }
    if (filters.client) {
        condittions.push('c.name LIKE ?');
        values.push(`%${filters.client}%`);
    }
    if (filters.expiredDate) {
        condittions.push('s.expired_date BETWEEN ? AND ?');
        values.push(filters.expiredDate.start, filters.expiredDate.end);
    }
    if (filters.paymentStatus) {
        condittions.push("s.payment_status = ?");
        values.push(filters.paymentStatus)
    }

    const whereClause = condittions.length > 0 ? 'WHERE ' + condittions.join(' AND ') : '';
    
    const [invoices]= await pool.query(
        `SELECT s.sale_id as id, s.date, c.name as client, s.purchase_order_id, s.expiration_date, s.payment_status, s.invoice
        FROM sales s
        JOIN clients c ON s.client_id = c.UniqueID
        ${whereClause} LIMIT ? OFFSET ?`, 
        [...values, limit, offset]
    );

    // Get total count of products for pagination
    const [[{total}]] = await pool.query(
        `SELECT COUNT(*) as total 
        FROM sales s
        INNER JOIN clients c ON s.client_id = c.UniqueID 
        ${whereClause}`, 
        values
    );

    return { invoices, total };
};

export const getInvoiceClientByID = async (id) => {
    // Get a specific order by ID
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [invoice] = await connection.query(
            `SELECT s.sale_id as id, s.date, c.nit, c.name as client, s.purchase_order_id, s.expiration_date, s.payment_status, s.invoice
            FROM sales s
            JOIN clients c ON s.client_id = c.UniqueID
            WHERE s.sale_id = ?`, 
            [id]
        );

        const [products] = await connection.query(
            `SELECT p.name as product, ip.purchase_price, ip.invoice_supplier_id, ip.und, ip.quantity, ip.price
            FROM sale_invoice_products ip
            INNER JOIN products p ON ip.product_id = p.UniqueID
            WHERE ip.sale_id = ?`, 
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

export const createInvoiceClient = async ({id, date, clientID, orderID, expirationDate, paymentStatus, attached, products}) => {
    // Insert the product into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO sales (sale_id, date, client_id, purchase_order_id, expiration_date, payment_status, invoice) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, date, clientID, orderID, expirationDate, paymentStatus, attached]
        );

        const invoiceID = result.insertId;
        
        for (const product of products) {
            await connection.query(
                'INSERT INTO sale_invoice_products (sale_id, product_id, purchase_price, invoice_supplier_id, und, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [invoiceID, product.productID, product.purchasePrice, product.invoiceSupplierID, product.und, product.quantity, product.price]
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

export const updateInvoiceClient = async (id, generalDates, products) => {
    // Update the product in the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE sales SET date = ?, client_id = ?, purchase_order_id = ?, expiration_date = ?, payment_status = ?, invoice = ? WHERE sale_id = ?',
            [generalDates.date, generalDates.clientID, generalDates.purchaseOrderID, generalDates.expirationDate, generalDates.paymentStatus, generalDates.attached, id]
        );

        // Delete existing products for this order
        await connection.query('DELETE FROM sale_invoice_products WHERE sale_id = ?', [id]);

        // Insert updated products
        for (const product of products) {
            await connection.query(
                'INSERT INTO sale_invoice_products (sale_id, product_id, purchase_price, invoice_supplier_id, und, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, product.productID, product.purchasePrice, product.invoiceSupplierID, product.und, product.quantity, product.price]
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

export const deleteInvoiceClient = async (ID) => {
    // Delete the product from the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [resultDetail] = await connection.query(
            'DELETE FROM sale_invoice_products WHERE sale_id = ?',
            [ID]
        )

        const [result] = await connection.query(
            'DELETE FROM sales WHERE sale_id = ?',
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