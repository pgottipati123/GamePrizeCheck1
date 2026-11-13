import { Router } from 'express';
import { createCatalogController } from '../controllers/catalogController.js';
import { requireAdminKey } from '../middleware/requireAdminKey.js';

export function createApiRouter({ config, repository }) {
  const router = Router();
  const controller = createCatalogController(repository);

  router.get('/health', controller.health);
  router.get('/categories', controller.listCategories);
  router.get('/products', controller.listProducts);
  router.get('/products/:id', controller.getProduct);
  router.get('/products/:id/listings', controller.listProductListings);
  router.get('/filters', controller.getFilters);
  router.get('/deals', controller.listDeals);
  router.patch('/listings/:id', requireAdminKey(config), controller.updateListing);

  return router;
}
