import Magento from '../../../services/magento'
import updateGuestCart from '../../../helpers/magento/updateGuestCart'

export default async (req, res) => {

  try {
    const { items } = req.allParams()

    const {
      magentoHost,
      magentoToken
    } = req.getValidatedHeaders()

    const magento = new Magento(magentoHost, magentoToken)

    const cartId = await magento.createCart()
    if (items && items.length) {
      // if items are passed add them to the cart
      await updateGuestCart({ host: magentoHost, token: magentoToken, cartId, items })
    }

    return res.status(201).send(cartId)
  } catch (e) {
    console.log(e)
    return res.status(400).send(e)
  }

}