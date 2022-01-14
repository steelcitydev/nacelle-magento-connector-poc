import chalk from 'chalk'
import { environment } from '../config/app'

const isProd = environment === 'production'
const write = (writer, ...args) => {
  if (isProd) {
    // surpress messages
    return
  }
  const [message, ...rest] = args
  console.log(writer(message), ...rest)
}

export default {
  error(...args) {
    write(chalk.red, ...args)
  },

  warn(...args) {
    write(chalk.yellow, ...args)
  },

  info(...args) {
    write(chalk.green, ...args)
  },

  debug(...args) {
    write(chalk.blue, ...args)
  }
}
