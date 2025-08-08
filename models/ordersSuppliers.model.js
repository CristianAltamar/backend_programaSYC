import { pool } from "../DB/connection.js";

// Integrar las ordenes de compra aproveedores antes de usar

export const getOrderSupplier = async (filters = {}, limit = 10, page = 1) => {
    const offset = (page - 1) * limit;
    const condittions = [];
    const values = [];

    if (filters.id) {
        condittions.push('o.order_id = ?');
        values.push(filters.id);
    }
    if (filters.date) {
        condittions.push('o.date BETWEEN ? AND ?');
        values.push(filters.date.start, filters.date.end);
    }
    if (filters.quoteID) {
        condittions.push('o.quote_id = ?');
        values.push(filters.quoteID);
    }
    if (filters.supplier) {
        condittions.push('c.name LIKE ?');
        values.push(`%${filters.supplier}%`);
    }

    const whereClause = condittions.length > 0 ? 'WHERE ' + condittions.join(' AND ') : '';
    
    const [orders]= await pool.query(
        `SELECT o.purchase_order_id as id, o.date, c.name as supplier, o.quote_id, o.delivery, o.attached_order
        FROM purchase_orders o
        JOIN suppliers c ON o.supplier_id = c.UniqueID
        ${whereClause} LIMIT ? OFFSET ?`, 
        [...values, limit, offset]
    );

    // Get total count of products for pagination
    const [[{total}]] = await pool.query(
        `SELECT COUNT(*) as total 
        FROM purchase_orders o 
        INNER JOIN suppliers c ON o.supplier_id = c.UniqueID 
        ${whereClause}`, 
        values
    );

    return { orders, total };
};

export const getOrderSupplierByID = async (id) => {
    // Get a specific order by ID
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [order] = await connection.query(
            `SELECT o.purchase_order_id as id, o.date, c.nit as supplierID, c.name as supplier, o.quote_id, o.delivery, o.attached_order
            FROM purchase_orders o
            JOIN suppliers c ON o.supplier_id = c.UniqueID
            WHERE o.purchase_order_id = ?`, 
            [id]
        );

        const [orders] = await connection.query(
            `SELECT p.name as product, po.und, po.quantity, po.price
            FROM products_purchase_orders po
            INNER JOIN products p ON po.product_id = p.UniqueID
            WHERE po.purchase_order_id = ?`, 
            [id]
        );
        await connection.commit();
        return { order: order[0], orders };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const createOrderSupplier = async ({id, date, supplierID, quoteID, delivery, attached, products}) => {
    // Insert the product into the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO purchase_orders (purchase_order_id, date, supplier_id, quote_id, delivery, attached_order) VALUES (?, ?, ?, ?, ?, ?)',
            [id, date, supplierID, quoteID, delivery, attached]
        );

        const orderID = result.insertId;
        
        for (const product of products) {
            await connection.query(
                'INSERT INTO products_purchase_orders (purchase_order_id, product_id, und, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [orderID, product.productID, product.und, product.quantity, product.price]
            );
        } 

        await connection.commit();
        return { message: 'Order created successfully', orderID };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const updateOrderSupplier = async (id, generalDates, products) => {
    // Update the product in the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE purchase_orders SET date = ?, supplier_id = ?, quote_id = ?, delivery = ?, attached_order = ? WHERE purchase_order_id = ?',
            [generalDates.date, generalDates.supplierID, generalDates.quoteID, generalDates.delivery, generalDates.attached, id]
        );

        // Delete existing products for this order
        await connection.query('DELETE FROM products_purchase_orders WHERE purchase_order_id = ?', [id]);

        // Insert updated products
        for (const product of products) {
            await connection.query(
                'INSERT INTO products_purchase_orders (purchase_order_id, product_id, und, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [id, product.productID, product.und, product.quantity, product.price]
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

export const deleteOrderSupplier = async (ID) => {
    // Delete the product from the database
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [resultDetail] = await connection.query(
            'DELETE FROM products_purchase_orders WHERE purchase_order_id = ?',
            [ID]
        )

        const [result] = await connection.query(
            'DELETE FROM purchase_orders WHERE purchase_order_id = ?',
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
}

