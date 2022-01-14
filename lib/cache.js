import ERRORS from './errors'

const cache = new Map()
const cleanup = 60 * 1000 // one min

const cacheManager = {
  /**
   * Create a string key for cache
   * @param {...string[]} args - list of strings to concatenate
   * @return {string} concatenated string with colon separation
   */
  key(...args) {
    return args.join(':')
  },

  /**
   * Set the cache key and value
   * @param {string} key - Cache key
   * @param {any} value - Can contain any node
   * @param {boolean} autoclean - Defaults to true
   */
  set(key, value, autoclean = true) {
    const exists = cache.has(key)
    if (exists) {
      throw new Error(ERRORS.cacheKeyExists)
    }
    cache.set(key, value)
    if (autoclean) {
      initSelfClean(key)
    }
  },

  /**
   * Delete the cache by key
   * @param {string} key
   */
  delete(key) {
    if (!cache.has(key)) {
      throw new Error(ERRORS.cacheKeyDoesNotExist)
    }
    cache.delete(key)
  },

  /**
   * Get the cached reference by key
   * @param {string} key
   * @return {any}
   */
  get(key) {
    return cache.get(key)
  },

  /**
   * Check if ref exists by key
   * @param {string} key
   * @return {any}
   */
  has(key) {
    return cache.has(key)
  }
}

/**
 * Self cleaning function to remove the cached item on given frequency
 * @param {string} key
 */
export const initSelfClean = (key, wait = cleanup) => {
  return new Promise(resolve => {
    setTimeout(() => {
      cacheManager.delete(key)
      resolve(key)
    }, wait)
  })

}

export default () => cacheManager