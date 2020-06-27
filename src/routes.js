const { Router } = require("express");
const municipioController = require("./controller/municipiosController");
const usersController = require("./controller/usersController");
const routes = Router();

routes.get("/users", usersController.getUsers);
routes.post("/users", usersController.store);

routes.get("/municipio", municipioController.getMunicipio);
routes.get("/municipios", municipioController.getMunicipios);
routes.get("/municipio/user", municipioController.getMunicipioUser);
routes.get("/municipios/user", municipioController.getMunicipiosUser);
routes.get("/create/municipio", municipioController.createMunicipios);

module.exports = routes;
