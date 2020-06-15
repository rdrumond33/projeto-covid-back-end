const mongoose = require('mongoose')

const UsersSchema = new mongoose.Schema({
    name: String,
    municipio:String,
    cod_municipio: Number,
    location:{
        type: PointSchema,
        index:'2dsphere'
    }

})

module.exports = mongoose.model('User',UsersSchema)
