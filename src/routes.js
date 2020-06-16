const { Router } = require("express");
const MunicipioController = require("./controller/municipiosController");
const routes = Router();

routes.get("/users", (req, res) => {
  res.json("userts");
});

routes.post("/users", (req, res) => {
  res.json("userts");
});

routes.get("/municipio", MunicipioController.getMunicipio);
routes.get("/create/municipio", MunicipioController.createMunicipios);

module.exports = routes;
