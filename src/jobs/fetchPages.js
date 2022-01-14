import Magento from '../services/magento'
import { connector } from '../../config/app'
import normalizer from '../normalizers/page'
import fetchMagento from '../helpers/magento/concurrentlyFetchMagento'

export default {

  friendlyName: 'Fetch Pages Magento',

  description: 'Fetch Pages from Magento Store',

  inputs: {
    magentoHost: {
      type: 'string',
      description: 'Magento API host',
      required: true
    },
    magentoToken: {
      type: 'string',
      description: 'Magento API access token',
      required: true
    },
    xNacelleSpaceId: {
      type: 'string',
      description: 'Nacelle Organization ID',
      required: true
    },
    xNacelleSpaceToken: {
      type: 'string',
      description: 'Nacelle Organization access token',
      required: true
    },
    sourceDomain: {
      type: 'string',
      description: 'Magento source sync domain',
      required: true
    },
    limit: {
      type: 'number',
      description: 'Limit to fetch pages',
      defaultsTo: 300
    },
    secure: {
      type: 'boolean',
      description: 'Set http or https protocol',
      defaultsTo: false
    }
  },

  exits: {
    success: {
      done: 'Yay done'
    }
  },

  async fn({
    magentoHost,
    magentoToken,
    xNacelleSpaceId,
    xNacelleSpaceToken,
    sourceDomain,
    limit,
    secure
  }, exits) {
    try {
      const magento = new Magento(magentoHost, magentoToken)
      // Initial fetch, retrieve Magento store config and cms pages
      // these will run concurrently
      const promises = [
        magento.getStoreConfig(secure),
        fetchMagento({ host: magento.host, token: magento.token, type: 'pages', limit })
      ]
      // assign store config and products response
      const [storeConfig, pages] = await Promise.all(promises)

      const items = pages.map(page => normalizer(page, { locale: storeConfig.locale }))

      // offload the dilithium push to the jobs queue
      connector.jobs.schedule('push-dilithium', {
        items,
        sourceDomain,
        xNacelleSpaceId,
        xNacelleSpaceToken,
        resource: 'content',
        type: 'cms'
      })

      return exits.success(items)
    } catch (e) {
      return exits.error(new Error(e))
    }

  }
}