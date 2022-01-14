export default (req, __, next) => {
    req.allParams = () => {
      return { ...req.params, ...req.body, ...req.query }
    }
    next()
  }