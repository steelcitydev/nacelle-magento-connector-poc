import collectionNormalizer from '../normalizers/collection'
import { slugify } from './stringHelpers'

const searchCriteriaMap = {
  limit: 'page_size',
  page: 'current_page'
}

export const IGNORE_CATEGORIES = ['Root Catalog', 'Default Category']

export const actionMap = {
  categories: 'getCategories',
  pages: 'getPages',
  products: 'getProducts'
}

/**
 * Group the Products by Category ID
 * @param {array} products The array of products to group by ID
 * @return {object}
 */
export const groupProductsByCategoryId = (products) => {
  const productGroups = {}
  // loop through all of the products given
  for (let i = 0, n = products.length; i < n; i++) {
    const product = products[i]
    if (product.extension_attributes && product.extension_attributes.category_links) {
      for (let c = 0, l = product.extension_attributes.category_links.length; c < l; c++) {
        const { category_id: id } = product.extension_attributes.category_links[c]
        if (!productGroups[id]) {
          productGroups[id] = []
        }
        productGroups[id].push(slugify(product.name))
      }
    }
  }
  return productGroups
}

/**
 * Ignore specific categories from being processed
 * @param {array} categories
 * @param {...string[]} ignore The names of the categories to ignore
 */
const ignoreCategories = (categories, ...ignore) => {
  return ignore.length ? categories.filter(x => ignore.indexOf(x.name) === -1) : categories
}

/**
 * Bind the Products to their respective Categories
 * @param {array} categories
 * @param {array} products
 * @param {object} config
 * @return {array}
 */
export const bindCategoriesProducts = (categories, products, config) => {
  const filteredProducts = products.filter(x => x.name)
  const groupedProductsByCategory = groupProductsByCategoryId(filteredProducts)
  return ignoreCategories(categories, ...IGNORE_CATEGORIES)
    .map(category => {
      const entity = collectionNormalizer(category, config)

      const boundProducts = groupedProductsByCategory[category.id]
      if (boundProducts) {
        entity.productLists.push({
          title: 'default',
          slug: 'default',
          locale: config.locale,
          handles: boundProducts
        })
      }
      return entity
    })
}

/**
 * @method buildSearchParams
 * @description build search params for query
 *
 * @param {object} params
 *
 * @return {object} - searchCriteria
 */
export const buildSearchParams = (params) => {
  const mapped = Object.keys(params).reduce((output, key) => {
    const param = searchCriteriaMap[key]
    if (!param) {
      throw new Error(`Invalid param ${param}`)
    }
    output[param] = params[key]
    return output
  }, {})

  return {
    searchCriteria: mapped
  }

  // TODO: add support for additional search params
  // searchCriteria[filterGroups][0][filters][0][field]
  // searchCriteria[filterGroups][0][filters][0][value]
  // searchCriteria[filterGroups][0][filters][0][conditionType]
  // searchCriteria[sortOrders][0][field]
  // searchCriteria[sortOrders][0][direction]
  // searchCriteria[pageSize]
  // searchCriteria[currentPage]
}

export default {
  groupProductsByCategoryId,
  bindCategoriesProducts,
  buildSearchParams
}