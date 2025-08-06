import express from 'express';
import { client, quotes, purchaseOrder, sale, payment } from './middleware/create_info/clients';
import { product } from './middleware/create_info/products';
import {MWCreateSupplier, MWCreateQuoteSupplier, MWCreatePurchaseInvoice, MWCreatePaymentSupplier} from './middleware/create_info/supplier';

const app = express();

app.use(express.json());

app.post("api/create/qoute/suplier", (req, res) => {
    MWCreateQuoteSupplier(req, res);
});

app.post("api/create/supplier", (req, res) => {
    MWCreateSupplier(req, res);
});

app.post("api/create/purchase/invoice/supplier", (req, res) => {
    MWCreatePurchaseInvoice(req, res);
});

app.post("api/create/payment/supplier", (req, res) => {
    MWCreatePaymentSupplier(req, res);
});

app.post("api/create/client", (req, res) => {
    client(req, res);
});

app.post("api/create/quote/client", (req, res) => {
    quotes(req, res);
});

app.post("api/create/purchase/order", (req, res) => {
    purchaseOrder(req, res);
});

app.post("api/create/sale", (req, res) => {
    sale(req, res);
});

app.post("api/create/product", (req, res) => {
    product(req, res);
});

app.post("api/create/payment", (req, res) => {
    payment(req, res);
});