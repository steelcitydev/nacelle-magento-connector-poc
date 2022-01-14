import Machine from 'machine'
import Magento from '../../services/magento'

const helper = {

  friendlyName: 'Update Cart Items',

  description: 'Update Items in Magento Cart, this will add, update, or remove items',

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
    cartId: {
      type: 'string',
      description: 'Cart Quote ID',
      required: true
    },
    items: {
      type: 'ref',
      description: 'Array of items to update',
      required: true
    }
  },

  exits: {
    success: {
      done: 'Yay done'
    }
  },

  async fn({ host, token, cartId, items }, exits) {
    const magento = new Magento(host, token)

    try {

      const cart = await magento.getCart(cartId)
      // start with removing the items that do not exist in the request
      const promises = cart.items.reduce((output, item) => {
        const found = items.find(x => x.sku === item.sku)
        if(!found) {
          output.push(magento.cartRemoveItem(cartId, item.item_id))
        }
        return output
      }, [])
      // now determine if they're new or update
      promises.push(...items.reduce((output, item) => {
        const inCartItem = cart.items.find(x => x.sku === item.sku)
        if (inCartItem) {
          const update = {
            cart_item: {
              item_id: inCartItem.item_id,
              qty: item.qty,
              quote_id: cartId
            }
          }
          if(item.qty !== inCartItem.qty) {
            output.push(magento.cartUpdateItem(cartId, inCartItem.item_id, update))
          }
        } else {
          item.quote_id = cartId
          output.push(magento.cartAddItem(cartId, { cart_item: item }))
        }

        return output
      }, []))

      await Promise.all(promises)
      const updatedCart = await magento.getCart(cartId)

      return await exits.success(updatedCart.items)
    } catch (e) {
      return exits.error(new Error(e))
    }
  }
}

export default Machine(helper)