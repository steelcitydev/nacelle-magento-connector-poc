import updateGuestCart from '../../../helpers/magento/update-guest-cart'
import { requireParams } from '../../../utils/request'

export default async (req, res) => {

  try {
    requireParams(req, 'cartId', ['items', 'array'])

    const { cartId, items } = req.allParams()

    const {
      magentoHost,
      magentoToken
    } = req.getValidatedHeaders()

    const results = await updateGuestCart({ host: magentoHost, token: magentoToken, cartId, items })

    return res.status(200).send(results)
  } catch (e) {
    return res.status(400).send(e)
  }

}
