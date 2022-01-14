import qs from 'querystrings'

import appConfig from '../../config/app'
import request from '../utils/request'
import { slugify } from '../utils/stringHelpers'

import { buildSearchParams } from '../utils/magentoHelpers'

export default class Magento {

  constructor(host, token, secure = true) {
    if (!host || !token) {
      throw new Error('Host and Token required')
    }
    this.host = host
    this.token = token
    this._secure = secure
    // defaults to true
    this.isGuest = true

    this.request = this.request.bind(this)
  }

  set secure(isSecure) {
    this._secure = isSecure
  }

  get secure() {
    return this._secure
  }

  get authHeader() {
    return {
      Authorization: `Bearer ${this.token}`
    }
  }

  get storeConfig() {
    if (this._configuredStore) {
      return this._configuredStore
    }
    return this._configuredStore = {
      locale: slugify(this._storeConfig.locale),
      currencyCode: this._storeConfig.base_currency_code,
      mediaUrl: this.secure ? this._storeConfig.base_media_url : this._storeConfig.secure_base_media_url,
      staticUrl: this.secure ? this._storeConfig.base_static_url : this._storeConfig.secure_base_static_url,
      baseUrl: this.secure ? this._storeConfig.base_url : this._storeConfig.secure_base_url
    }
  }

  get cartType() {
    return this.isGuest ? 'guest-carts' : 'carts'
  }

  /**
   * Get the Store Config
   * @return {object} - default store
   */
  async getStoreConfig() {
    const [defaultStore] = await this.request('store/storeConfigs')
    if (!defaultStore) {
      throw new Error('Cannot find default store config')
    }
    this._storeConfig = defaultStore
    return this.storeConfig
  }

  /**
   * Get Store Categories
   * @param {object} options
   * @return {array}
   */
  async getCategories({ limit = appConfig.app.request.limit, page = 1 }) {
    const params = this.buildSearchParams({ limit, page })
    return await this.request('categories/list', params)
  }

  /**
   * Get Store Products
   * @param {object} options
   * @return {object} - { items, search_criteria, total_count }
   */
  async getProducts({ limit = appConfig.app.request.limit, page = 1 }) {
    const params = buildSearchParams({ limit, page })
    return await this.request('products', params)
  }

  /**
   * Get a Product by SKU
   * @param {string} sku
   * @return {Product}
   */
  async getProductBySku(sku) {
    return await this.request(`products/${sku}`)
  }

  /**
   * Get Store Pages
   * @param {object} options
   * @return {object} - { items, search_criteria, total_count }
   */
  async getPages({ limit, page }) {
    const params = this.buildSearchParams({ limit, page })
    return await this.request('cmsPage/search', params)
  }

  /**
   * Get Guest Cart by Quote ID
   * @param {string|number} cartId
   * @return {Cart}
   */
  async getCart(cartId) {
    const url = `${this.cartType}/${cartId}`
    return await this.request(url)
  }

  /**
   * Create a new Cart
   * @return {string} Cart ID
   */
  async createCart() {
    return await this.request(this.cartType, null, 'POST')
  }

  /**
   * Add Item to Cart
   * @param {string|number} cartId
   * @param {object} item
   * @return {string} Quote ID
   */
  async cartAddItem(cartId, item) {
    const url = `${this.cartType}/${cartId}/items`;
    return await this.request(url, item, 'POST')
  }

  /**
   * Update an Item in a Cart
   * @param {string|number} cartId
   * @param {number} itemId
   * @param {object} item
   * @return {string} Quote ID
   */
  async cartUpdateItem(cartId, itemId, item) {
    const url = `${this.cartType}/${cartId}/items/${itemId}`
    return await this.request(url, item, 'PUT')
  }

  /**
   * Remove an Item from a Cart
   * @param {string|number} cartId
   * @param {number} itemId
   * @return {boolean}
   */
  async cartRemoveItem(cartId, itemId) {
    const url = `${this.cartType}/${cartId}/items/${itemId}`
    return await this.request(url, null, 'DELETE')
  }

  /**
   * Get available payment Options for Cart
   * @param {string|number} cartId
   * @return {array} payment options
   * ex:
   * [{
   *   "code": "checkmo",
   *   "title": "Check / Money order"
   *  }]
   */
  async getPaymentMethods(cartId) {
    const url = `${this.cartType}/${cartId}/payment-methods`
    return await this.request(url)
  }

  /**
   * Set the Shipping Info for the Cart
   * @param {string|number} cartId
   * @param {object} data Magento { addressInformation: { shipping_address: address } }
   */
  async setCartInfo(cartId, info) {
    const url = `${this.cartType}/${cartId}/shipping-information`
    return await this.request(url, info, 'POST')
  }

  /**
   * Create a new Order for the Cart
   * @param {string|number} cartId
   * @param {object} paymentInfo
   * @return {string} orderId
   */
  async createOrder(cartId, paymentInfo) {
    const url = `${this.cartType}/${cartId}/payment-information`
    return await this.request(url, paymentInfo, 'POST')
  }

  /**
   * Get an Order by ID
   * @param {number} orderId
   * @return {Order}
   */
  async getOrder(orderId) {
    const url = `orders/${orderId}`
    return await this.request(url)
  }

  /**
   * Get the Shipping Methods available to Cart
   * @param {number} cartId
   * @param {object} address Magento Address Model
   * @return {array} A list of available shipping methods
   * ex:
   * [
   *   {
   *       "carrier_code": "flatrate",
   *       "method_code": "flatrate",
   *       "carrier_title": "Flat Rate",
   *       "method_title": "Fixed",
   *       "amount": 15,
   *       "base_amount": 15,
   *       "available": true,
   *       "error_message": "",
   *       "price_excl_tax": 15,
   *       "price_incl_tax": 15
   *   }
   * ]
   */
  async getShippingMethodsByAddress(cartId, address) {
    const url = `${this.cartType}/${cartId}/estimate-shipping-methods`
    return await this.request(url, { address }, 'POST')
  }

  /**
   * Get country info by Country Code
   * @param {string} countryCode
   * @return {object}
   */
  async getCountryByCode(countryCode) {
    const url = `directory/countries/${countryCode}`
    return await this.request(url)
  }

  /**
   * Get Countries List
   * @return {array}
   */
  async getAllCountries() {
    return await this.request('directory/countries')
  }

  /**
   * Ajax request helper for Magento
   * @description ajax helper via axios, formats params for Magento
   * @param {string} uri
   * @param {object} params
   * @return {promise<any>}
   */
  async request(uri, params = {}, method = 'GET') {
    let url = `${this.host}/${uri}`

    if (method === 'GET' && Object.keys(params).length) {
      url += `?${qs.stringify(params)}`
    }
    const queryParams = method === 'GET' ? {} : params
    return await request(url, method, queryParams, this.authHeader)
  }

}