import 'dotenv/config'

const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

export const Config = {
  PORT,
  NODE_ENV,
}
