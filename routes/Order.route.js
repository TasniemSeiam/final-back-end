const express = require('express');
const {
  checkoutSession,
  createCashOrder,
  filterOrderForLoggedUser,
  findAllOrders,
  findSpecificOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderToCancel,
} = require('../controllers/Order.controller');

const auth = require('../controllers/Auth.controller');

const router = express.Router();

router.use(auth.protect);

router.post(
  '/checkout-session/:cartId',
  auth.allowedTo('user'),
  checkoutSession
);

router.route('/:cartId').post(auth.allowedTo('user'), createCashOrder);
router.get(
  '/',
  auth.allowedTo('user', 'admin', 'seller'),
  filterOrderForLoggedUser,
  findAllOrders
);
router.get('/:id', findSpecificOrder);

router.put(
  '/:id/pay',
  auth.allowedTo('admin', 'seller'),
  updateOrderToPaid
);
router.put(
  '/:id/deliver',
  auth.allowedTo('admin', 'seller'),
  updateOrderToDelivered
);
router.put(
  '/:id/cancel',
  auth.allowedTo('admin', 'seller'),
  updateOrderToCancel
);

module.exports = router;