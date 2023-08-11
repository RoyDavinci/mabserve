import dbConfig from './db'
import serverConfig from './server'
import paymentConfig from './payment'

const config = { ...dbConfig, ...serverConfig, ...paymentConfig }

export default config
