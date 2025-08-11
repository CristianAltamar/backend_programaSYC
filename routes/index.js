import express from 'express';
const router = express.Router();

import products from './products.routes.js';
import suppliers from './suppliers.routes.js';
import clients from './clients.routes.js';
import quotesClients from './quotesClients.routes.js';
import quotesSuppliers from './quotesSuppliers.routes.js';
import invoicesClients from './invoicesClients.routes.js';
import ordersclients from './ordersClients.routes.js';
import ordersSuppliers from './ordersSuppliers.routes.js';
import invoicesSuppliers from './invoicesSuppliers.routes.js';
import paymentsClients from './paymentsClients.routes.js';
import paymentsSuppliers from './paymentsSuppliers.routes.js';

router.use('/products', products);
router.use('/clients', clients);
router.use('/suppliers', suppliers);
router.use('/quotesClients', quotesClients);
router.use('/quotesSuppliers', quotesSuppliers);
router.use('/invoicesClients', invoicesClients);
router.use('/invoicesSuppliers', invoicesSuppliers);
router.use('/ordersClients', ordersclients);
router.use('/ordersSuppliers', ordersSuppliers);
router.use('/paymentsClients', paymentsClients);
router.use('/paymentsSuppliers', paymentsSuppliers);

export default router;