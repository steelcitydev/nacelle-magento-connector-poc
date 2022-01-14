const indexingHeaders = [
    'x-nacelle-space-id',
    'x-nacelle-space-token',
    'source-domain'
  ]
  
  export default {
    // Indexing Routes
    'POST /magento/index-products': {
      controller: 'magento/index/products',
      requiredHeaders: indexingHeaders
    },
    'POST /magento/index-collections': {
      controller: 'magento/index/collections',
      requiredHeaders: indexingHeaders
    },
    // @deprecated will remove 0.1.0 use /index-content pass body param 'pages'
    'POST /magento/index-pages': {
      controller: 'magento/index/pages',
      requiredHeaders: indexingHeaders
    },
    'POST /magento/index-content': {
      controller: 'magento/index/content',
      requiredHeaders: indexingHeaders
    },
    // Cart
    'POST /magento/cart': 'magento/cart/create',
    'GET /magento/cart/:cartId': 'magento/cart/find-one',
    'PUT /magento/cart/:cartId': 'magento/cart/update',
    'GET /magento/cart/:cartId/payment-methods': 'magento/cart/payment-methods',
    'POST /magento/cart/:cartId/shipping-methods': 'magento/cart/shipping-methods',
    'POST /magento/cart/:cartId/total': 'magento/cart/total',
    // Checkout
    'POST /magento/checkout/:cartId': 'magento/cart/checkout',
    // Orders
    'GET /magento/orders/:orderId': 'magento/order/find-one'
  }