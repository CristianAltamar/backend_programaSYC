import express from 'express';
const router = express.Router();

import * as products from './products.routes.js';
import * as clients from './clients.routes.js';
import * as suppliers from './suppliers.routes.js';
import * as quotesClients from './quotesClients.routes.js';
import * as quotesSuppliers from './quotesSuppliers.routes.js';
import * as invoicesClients from './invoicesClients.routes.js';
import * as ordersclients from './ordersClients.routes.js';
import * as ordersSuppliers from './ordersSuppliers.routes.js';
import * as invoicesSuppliers from './invoicesSuppliers.routes.js';
import * as paymentsClients from './paymentsClients.routes.js';
import * as paymentsSuppliers from './paymentsSuppliers.routes.js';

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