import Magento from '../../../services/magento'
import { requireParams } from '../../../utils/request'

export default async (req, res) => {

  try {
    requireParams(req, 'cartId', ['address', 'object'])

    const { cartId, address } = req.allParams()

    const {
      magentoHost,
      magentoToken
    } = req.getValidatedHeaders()

    const magento = new Magento(magentoHost, magentoToken)
    const results = await magento.getShippingMethodsByAddress(cartId, address)

    return res.status(200).send(results)
  } catch (e) {
    return res.status(400).send(e.message)
  }

}