const csv = require("csv-parser");
const fs = require("fs");
var iconv = require("iconv-lite");

const results = [];
const results_latitude = [];

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

fs.createReadStream("./scripts/notificacoes-covid19-mg.csv")
  .pipe(iconv.decodeStream("ISO-8859-1"))
  .pipe(csv({ separator: ";" }, { headers: false }))
  .on("data", (row) => {
    row["MUNICIPIO_RESIDENCIA"] = removeAcento(
      row["MUNICIPIO_RESIDENCIA"].trim()
    ).toLowerCase();

    results.push(row);
  })
  .on("end", () => {
    fs.createReadStream("./scripts/latitude_longitude_municipios.csv")
      .pipe(iconv.decodeStream("ISO-8859-1"))
      .pipe(csv({ separator: "," }, { headers: false }))
      .on("data", (row) => {
        results_latitude.push(row);
      })
      .on("end", () => {
        const mongo_result = [];
        results.forEach((e) => {
          results_latitude.forEach((f) => {
            let cod = f["codigo_ibge"];
            if (e["MUNICIPIO_RESIDENCIA_COD"] == cod.slice(0, cod.length - 1)) {
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
        console.log(mongo_result);
      });
  });
