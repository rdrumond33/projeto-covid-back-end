const mongoose = require("mongoose");
const PointSchema = require("./utils/PointSchema.js");
const MunicipiosSchema = new mongoose.Schema({
  municipio: String,
  cod_municipio: String,
  covid: {
    confirmados: Number,
    recuperados: Number,
    acompanhamento: Number,
    obito: Number,
  },
  location: {
    type: PointSchema,
    index: "2dsphere",
  },
},{
    timestamps:true
});

module.exports = mongoose.model("Municipio", MunicipiosSchema);
