import Machine from 'machine'
import Magento from '../../services/magento'

import { makeArray } from '../../utils/arrayHelpers'
import { actionMap } from '../../utils/magentoHelpers'

const helper = {

  friendlyName: 'Concurrently Fetch Magento',

  description: 'Concurrently Fetch Items from Magento store. This works only for API endpoints with search criteria',

  inputs: {
    host: {
      type: 'string',
      description: 'Magento host url',
      required: true
    },
    token: {
      type: 'string',
      description: 'Magento access token',
      required: true
    },
    type: {
      type: 'string',
      description: 'Magento stores to get',
      required: true
    },
    limit: {
      type: 'number',
      description: 'The size of the get request',
      defaultsTo: 1
    }
  },

  exits: {
    success: {
      done: 'Yay done'
    }
  },

  async fn({ host, token, type, limit }, exits) {
    // Init Magento service
    const magento = new Magento(host, token)
    // get process action
    const action = magento[actionMap[type]].bind(magento)
    if (!action || typeof action !== 'function') {
      return exits.error(new Error('Invalid Type'))
    }
    try {

      const {
        // get the product items
        items,
        // assign the search_criteria attribute to pager
        search_criteria: pager,
        // assign the total_count attribute to count
        total_count: count
      } = await action({ limit, page: 1 })
      // get the total pages contained in Magento store
      const totalPages = Math.ceil(count / pager.page_size)

      // check to see if there are more pages
      if (pager.current_page < totalPages) {
        // create an array to map the remaining requests
        const pending = makeArray(totalPages - 1)
        // the promises to run concurrently, offset by 2 to account for 0 based index
        const promises = pending.map(idx => action({ limit, page: idx + 2 }))
        // request remaining pages concurrently
        const results = await Promise.all(promises)
        items.push(...results.reduce((o, i) => o.concat(i.items), []))
      }

      return exits.success(items)
    } catch (e) {
      return exits.error(new Error(e))
    }
  }
}

export default Machine(helper)