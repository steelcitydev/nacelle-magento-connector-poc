export const buildMutation = (mutationName, inputType) => {
    return `mutation ${mutationName}($input: ${inputType}!) {
      ${mutationName}(input: $input) {
        count
        ids
      }
    }`
  }
  
  export default {
    buildMutation
  }