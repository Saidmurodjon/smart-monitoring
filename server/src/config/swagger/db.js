const mongoose = require("mongoose");
const { DB } = require("./config");
const winston = require("winston");
module.exports=function(){
    mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>{
        winston.debug("Mongodbga ulanish hosil qilindi")
    })
}



