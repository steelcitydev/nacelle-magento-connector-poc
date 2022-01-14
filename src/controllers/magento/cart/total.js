import Magento from '../../../services/magento'
import { requireParams } from '../../../utils/request'

export default async (req, res) => {

  try {
    requireParams(req, 'cartId', ['addressInformation', 'object'])

    const { cartId, addressInformation } = req.allParams()

    const {
      magentoHost,
      magentoToken
    } = req.getValidatedHeaders()

    const magento = new Magento(magentoHost, magentoToken)
    const results = await magento.setCartInfo(cartId, { addressInformation })

    return res.status(200).send(results)
  } catch (e) {
    return res.status(400).send(e.message)
  }

}