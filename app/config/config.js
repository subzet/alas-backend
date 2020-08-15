require('dotenv').config()

const googleKey = JSON.parse(process.env.GOOGLE_CREDENTIALS)

module.exports = { googleKey }