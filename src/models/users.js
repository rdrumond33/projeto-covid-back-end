const mongoose = require("mongoose");
const PointSchema = require("./utils/PointSchema.js");

const UsersSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user: { type: String, required: true, unique: true },
    passoword: { type: String },
    municipio: { type: String, required: true },
    cod_municipio: { type: String, required: true },
    empresa: { type: Boolean, required: true },
    doadora: { type: Boolean, required: true },
    dados: {
      rua: String,
      telefone_cel: String,
      telefone_res: String,
      setor: String,
      e_commerce: Boolean,
    },
    produtos_doar: {
      type: [
        {
          nome: { type: String },
          categoria: { type: String },
        },
      ],
      default: [],
    },
    location: {
      type: PointSchema,
      index: "2dsphere",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UsersSchema);
