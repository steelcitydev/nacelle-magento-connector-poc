export const camelCase = (str) => {
    return str.replace(/[^a-zA-Z0-9]+(.)/g, m => m[1].toUpperCase())
  }
  
  export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  
  export const removeTrailing = (str, char) => {
    const regExp = new RegExp(char + '+$');
    return str.replace(regExp, '');
  }
  
  export const slugify = (str) => {
    return removeTrailing(str.replace(/[^a-z0-9+]+/gi, '-').toLowerCase(), '-')
  }
  
  export default {
    camelCase,
    removeTrailing,
    slugify,
    capitalize
  }