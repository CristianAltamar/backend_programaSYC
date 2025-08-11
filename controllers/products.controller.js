import { createProduct, getProducts, updateProduct, deleteProduct } from "../models/products.model.js";

export const createProducts = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Missing required fields or invalid data' });
    }

    try {
        const productID = await createProduct({ name });
        res.status(201).json({ message: 'Product created successfully', productID });
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
}

export const getProductsController = async (req, res) => {
    const { name } = req.query;
    const id = Number(req.query.id) || "";

    const filters = { id, name };

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    try {
        const { products, total } = await getProducts(filters, limit, page);
        res.status(200).json({ products, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
}

export const updateProducts = async (req, res) => {
    const id = Number(req.params.id) || null;
    const { name } = req.body;

    if (!id || id < 1) res.status(400).json({ error: 'Product not found' });

    try {
        await updateProduct(id, { name });
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
}

export const deleteProducts = async (req, res) => {
    const id = Number(req.params.id) || null;

    if (!id || id < 1) res.status(400).json({ error: 'Product not found' });

    try {
        await deleteProduct(id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451 || err.errno === 1217) {
            res.status(400).json({ error: 'Cannot delete product, it is referenced by other records' });
        }

        res.status(500).json({ err: 'Error deleting product' });
    }
}