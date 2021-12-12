const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    portX: process.env.PORT,
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretKey: process.env.PINATA_SECRET_KEY
};