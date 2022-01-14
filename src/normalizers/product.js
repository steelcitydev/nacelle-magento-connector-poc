import { slugify } from '../utils/string-helpers'
import { getSeconds } from '../utils/date-helpers'
import { getAttribute } from '../utils/normalizer-helpers'

export default ({
  id: pimSyncSourceProductId,
  sku,
  name: title,
  attribute_set_id: collection,
  status,
  price,
  type_id: productType,
  custom_attributes: meta,
  media_gallery_entries: media,
  extension_attributes: attributes,
  created_at
}, {
  locale,
  currencyCode,
  mediaUrl
}) => {

  const baseUrl = `${mediaUrl}catalog/product`

  const _price = price ? price.toString() : '0'
  // create a new object
  const product = {
    locale,
    pimSyncSourceProductId,
    handle: slugify(title),
    title,
    productType,
    availableForSale: Boolean(status),
    priceRange: {
      min: _price,
      max: _price,
      currencyCode: currencyCode
    },
    createdAt: getSeconds(created_at),
    variants: []
  }

  if (attributes.length) {
    const description = getAttribute(attributes, 'description')
    if (description) {
      product.description = JSON.stringify(description)
    }
  }

  const metafields = meta
    .filter(x => x.attribute_code !== 'description')
    .map(({ attribute_code: key, value }) => ({
      namespace: '',
      key,
      value
    }))
  if (metafields.length) {
    product.metafields
  }

  if (media.length) {
    const _media = media.map(item => ({
      id: item.id,
      src: `${baseUrl}${item.file}`,
      thumbnailSrc: `${baseUrl}${item.file}`,
      type: item.media_type
    }))

    product.featuredMedia = _media[0]
    product.media = _media
  }

  // Push default variant
  product.variants.push({
    id: pimSyncSourceProductId,
    sku,
    title,
    availableForSale: product.availableForSale,
    price: _price,
    priceCurrency: currencyCode,
    featuredMedia: product.featuredMedia
  })

  if (attributes.configurable_product_options) {
    product.variants.push(...attributes.configurable_product_options.map(item => ({
      id: item.id,
      sku: item.sku,
      title: item.label,
      availableForSale: Boolean(status),
      price: _price,
      priceCurrency: currencyCode
    })))
  }

  return product
}