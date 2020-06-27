const Municipio = require("../models/municipios");
const User = require("../models/users");
const csv = require("csv-parser");
const fs = require("fs");
var iconv = require("iconv-lite");

function removeAcento(text) {
  text = text.toLowerCase();
  text = text.replace(new RegExp("[ÁÀÂÃ]", "gi"), "a");
  text = text.replace(new RegExp("[ÉÈÊ]", "gi"), "e");
  text = text.replace(new RegExp("[ÍÌÎ]", "gi"), "i");
  text = text.replace(new RegExp("[ÓÒÔÕ]", "gi"), "o");
  text = text.replace(new RegExp("[ÚÙÛ]", "gi"), "u");
  text = text.replace(new RegExp("[Ç]", "gi"), "c");
  return text;
}

module.exports = {
  async getMunicipio(request, response) {
    const longitude = request.query.longitude;
    const latitude = request.query.latitude;

    const result = await Municipio.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      },
    });
    return response.json(result);
  },

  async getMunicipios(request, response) {
    const result = await Municipio.find();
    return response.json(result);
  },

  async getMunicipioUser(request, response) {
    const user = request.query.user;

    if (user === "") {
      response.json("Obrigatorio passasr params user").status(400);
    }

    let user_result;
    try {
      user_result = await User.find({
        user,
      });
    } catch (error) {
      response.json(error).status(500);
    }

    if (!user_result) {
      response.json("Usuario nao encontrado").status(400);
    }

    const longitude = user_result[0].location["coordinates"][0],
      latitude = user_result[0].location["coordinates"][1];
    console.log(longitude);
    const result = await Municipio.findOne({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      },
    });
    return response.json(result);
  },

  async getMunicipiosUser(request, response) {
    const user = request.query.user;

    if (user === "") {
      response.json("Obrigatorio passasr params user").status(400);
    }

    let user_result;
    try {
      user_result = await User.find({
        user,
      });
    } catch (error) {
      response.json(error).status(500);
    }

    if (!user_result) {
      response.json("Usuario nao encontrado").status(400);
    }

    const longitude = user_result[0].location["coordinates"][0],
      latitude = user_result[0].location["coordinates"][1];

    const user_municipio = await Municipio.findOne({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      },
    });

    const municipios = await Municipio.find();

    return response.json({user_municipio,municipios});
  },


  createMunicipios(request, response) {
    const results = [];
    const results_latitude = [];

    fs.createReadStream("./scripts/notificacoes-covid19-mg.csv")
      .pipe(iconv.decodeStream("ISO-8859-1"))
      .pipe(
        csv(
          {
            separator: ";",
          },
          {
            headers: false,
          }
        )
      )
      .on("data", (row) => {
        row["MUNICIPIO_RESIDENCIA"] = removeAcento(
          row["MUNICIPIO_RESIDENCIA"].trim()
        ).toUpperCase();
        results.push(row);
      })
      .on("end", () => {
        fs.createReadStream("./scripts/latitude_longitude_municipios.csv")
          .pipe(iconv.decodeStream("ISO-8859-1"))
          .pipe(
            csv(
              {
                separator: ",",
              },
              {
                headers: false,
              }
            )
          )
          .on("data", (row) => {
            results_latitude.push(row);
          })
          .on("end", () => {
            const mongo_result = [];
            results.forEach((e) => {
              results_latitude.forEach((f) => {
                let cod = f["codigo_ibge"];
                if (
                  e["MUNICIPIO_RESIDENCIA_COD"] == cod.slice(0, cod.length - 1)
                ) {
                  if (
                    mongo_result.some(
                      (g) => g.cod_municipio === e["MUNICIPIO_RESIDENCIA_COD"]
                    )
                  ) {
                    if (e["CLASSIFICACAO_CASO"].trim() == "Caso Confirmado") {
                      for (let i in mongo_result) {
                        if (
                          mongo_result[i].cod_municipio ===
                          e["MUNICIPIO_RESIDENCIA_COD"]
                        ) {
                          mongo_result[i].covid["confirmados"] =
                            mongo_result[i].covid["confirmados"] + 1;
                        }
                      }
                    }
                    if (e["EVOLUCAO"].trim() === "RECUPERADO") {
                      for (let i in mongo_result) {
                        if (
                          mongo_result[i].cod_municipio ===
                          e["MUNICIPIO_RESIDENCIA_COD"]
                        ) {
                          mongo_result[i].covid["recuperados"] =
                            mongo_result[i].covid["recuperados"] + 1;
                        }
                      }
                    }
                    if (e["EVOLUCAO"].trim() === "EM ACOMPANHAMENTO") {
                      for (let i in mongo_result) {
                        if (
                          mongo_result[i].cod_municipio ===
                          e["MUNICIPIO_RESIDENCIA_COD"]
                        ) {
                          mongo_result[i].covid["acompanhamento"] =
                            mongo_result[i].covid["acompanhamento"] + 1;
                        }
                      }
                    }
                    if (e["EVOLUCAO"].trim() === "OBITO") {
                      for (let i in mongo_result) {
                        if (
                          mongo_result[i].cod_municipio ===
                          e["MUNICIPIO_RESIDENCIA_COD"]
                        ) {
                          mongo_result[i].covid["obito"] =
                            mongo_result[i].covid["obito"] + 1;
                        }
                      }
                    }
                  } else {
                    let confirmados = 0,
                      recuperados = 0,
                      acompanhamento = 0,
                      obito = 0;
                    if (e["EVOLUCAO"].trim() === "OBITO") {
                      obito = 1;
                    }
                    if (e["EVOLUCAO"].trim() === "EM ACOMPANHAMENTO") {
                      acompanhamento = 1;
                    }
                    if (e["EVOLUCAO"].trim() === "RECUPERADO") {
                      recuperados = 1;
                    }
                    mongo_result.push({
                      municipio: e["MUNICIPIO_RESIDENCIA"],
                      cod_municipio: e["MUNICIPIO_RESIDENCIA_COD"],
                      covid: {
                        confirmados: 1,
                        recuperados: recuperados,
                        acompanhamento: acompanhamento,
                        obito: obito,
                      },
                      location: {
                        type: "Point",
                        coordinates: [
                          parseFloat(f["longitude"]),
                          parseFloat(f["latitude"]),
                        ],
                      },
                    });
                  }
                }
              });
            });
            Municipio.insertMany(mongo_result).then((e) => {
              return response.json(e);
            });
          });
      });
  },
};
