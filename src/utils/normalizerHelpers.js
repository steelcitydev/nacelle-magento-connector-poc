export const getAttribute = (attributes, key) => {
    const attribute = attributes.find(x => x.attribute_code === key)
    if (attribute) {
      return attribute.value
    }
    return ''
  }
  
  export default {
    getAttribute
  }