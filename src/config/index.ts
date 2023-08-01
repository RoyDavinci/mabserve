import dbConfig from './db'
import serverConfig from './server'

const config = { ...dbConfig, ...serverConfig }

export default config
