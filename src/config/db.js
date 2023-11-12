const mongoose = require("mongoose");
const uriLocal = "mongodb://127.0.0.1:27017/tienda";
const uriRemota = "mongodb+srv://iDannyT:dgrBNobBWy4vIXbR@clustersdmtp.g8faxeg.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uriRemota);
const db = mongoose.connection;

module.exports = mongoose;