import axios from 'axios'
// set the axios global headers to support json
axios.defaults.headers.post['Content-Type'] = 'application/json'

export default async (url, method, params, headers) => {

  const options = { method, url, headers }
  if (params && method === 'GET') {
    options.params = params
  } else if(params) {
    options.data = params
  }

  try {
    const { data, errors } = await axios(options)
    // Catch errors just in case a proper error response code is not provided in response
    if (errors && errors.length) {
      return Promise.reject(errors)
    }
    return data
  } catch ({ response }) {
    return Promise.reject(response)
  }

}

export const requireParams = (req, ...required) => {
  const reqParams = req.allParams()

  const missingParams = required.reduce((missing, param) => {
    if(typeof param === 'string') {
      if(!reqParams.hasOwnProperty(param)) {
        missing.push(param)
      }
    } else if(Array.isArray(param)) {
      const [_param, type] = param
      if (type === 'array') {
        if(!reqParams.hasOwnProperty(_param) || !Array.isArray(reqParams[_param]) || !reqParams[_param].length) {
          missing.push(param)
        }
      } else {
        if (!reqParams.hasOwnProperty(_param) || typeof reqParams[_param] !== type) {
          missing.push(param)
        }
      }
    }
    return missing
  }, [])

  if(missingParams.length) {
    const missingOutput = missingParams.join(', ')
    throw new Error(`Invalid Param ${missingOutput}`)
  }

}