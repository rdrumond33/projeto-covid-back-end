const express = require("express");
const mongoose  = require("mongoose")
//** middalewares */
const morgan = require("morgan");
const cors = require("cors");

// Routes
const routes = require('./routes')
class App {
  constructor(port='') {
    this.app = express();
    this.port = port;
    /**  configuracoes iniciais*/
    this.setting();
    this.middalewares();
    this.routers();
    this.database();
  }
  database(){
      mongoose.connect("mongodb+srv://projetoCovidBackEnd:projetoCovidBackEnd@cluster0-jumdx.mongodb.net/covid?retryWrites=true&w=majority",{
        useUnifiedTopology: true,
        useNewUrlParser: true
      })
  }
  setting() {
    this.app.set("PORT", this.port || process.env.PORT || 3000);
  }

  middalewares() {
    // cors para liberar as rotas para requisisoes externas
    this.app.use(cors());
    // morgan ajuda nas mensagens de errors na hora de desenvolvimento
    this.app.use(morgan("dev"));

    // abilitar aceitação de json e forms via requisição http
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }
  routers() {
    // Rota Home
    this.app.get("/ping", (req, res) => {
      res.json("pong")
    });
   
    this.app.use(routes);
  }
  async listen() {
    await this.app.listen(this.app.get("PORT"), () => {
      console.log("Servidor Rodando na pota : " + this.app.get("PORT"));
    });
  }
}

module.exports = App
