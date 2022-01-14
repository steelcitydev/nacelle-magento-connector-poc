import request from '../utils/request'
import appConfig from '../../config/app'
import { buildMutation } from '../utils/dilithiumHelpers'

export default class Dilithium {

  constructor(domain, spaceId, token) {
    this.clientId = spaceId
    this.clientToken = token
    this.host = appConfig.dilithium.host
    this.domain = domain
    this.locale = 'en-us'
  }

  get authHeader() {
    return {
      'x-nacelle-space-id': this.clientId,
      'x-nacelle-space-token': this.clientToken
    }
  }

  buildQuery(type, resource, data, mutationName, inputType) {
    const query = buildMutation(mutationName, inputType)
    const variables = {
      input: {
        [type]: {
          syncSource: 'magento',
          syncSourceDomain: this.domain,
          defaultLocale: this.locale
        },
        [resource]: data
      }
    }
    return [query, variables]
  }

  async save(query, variables) {
    try {
      const url = `${this.host}/${this.clientId}`
      const params = { query, variables }
      return await request(url, 'POST', params, this.authHeader)
    } catch (e) {
      return Promise.reject(e)
    }
  }


}