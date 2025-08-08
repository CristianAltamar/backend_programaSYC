import { createProduct, getProducts, updateProduct, deleteProduct } from "../models/products.model.js";

export const createProducts = async (req, res) => {
    const { name } = req.body;
    try {
        const productID = await createProduct({ name });
        res.status(201).json({ message: 'Product created successfully', productID });
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
}

export const getProductsController = async (req, res) => {
    const { filters, limit = 10, page = 1 } = req.query;
    try {
        const { products, total } = await getProducts(JSON.parse(filters), limit, page);
        res.status(200).json({ products, total });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
}

export const updateProducts = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await updateProduct(id, { name });
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
}

export const deleteProducts = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteProduct(id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
}