const Municipio = require("../models/municipios");
const User = require("../models/users");

module.exports = {
  async store(request, response) {
    const {
      name,
      user,
      passoword,
      municipio,
      cod_municipio,
      empresa,
      doadora,
      longitude,
      latitude,
    } = request.body;

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const result = await User.create({
      name,
      user,
      passoword,
      municipio,
      cod_municipio,
      empresa,
      doadora,
      location,
    }).catch((e) => {
      response.json(e).status(400);
    });
    response.json(result)
  },

  async getUsers(request, response) {
    const user = request.query.user;
    const distance = parseInt(request.query.distance);

    if (user === "") {
      response.json("Obrigatorio passasr params user").status(400);
    }
    let user_result, result;

    try {
      user_result = await User.find({
        user,
      });
    } catch (error) {
      response.json(error).status(500);
    }

    if (!user_result) {
      response.json("data:Usuario nao encontrado").status(400);
    }

    const longitude = user_result[0].location["coordinates"][0],
      latitude = user_result[0].location["coordinates"][1];
    try {
      result = await User.find({
        $and:[{doadora: {$eq: true}},{user: {$ne: user}}],
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: isNaN(distance) ? 20000 : distance,
          },
        },
      });
    } catch (error) {
      response.json(error).status(500);
    }
    


    response.json({user:user_result,stores:result}).status(200);
  },

  async getUsersEmpresas(request, response) {
    const user = request.query.user;
    if (user === "") {
      response.json("Obrigatorio passasr params user").status(400);
    }
    let user_result, result;
    try {
      user_result = await User.find({
        user,
      });
    } catch (error) {
      response.json(error).status(500);
    }

    if (!user_result) {
      response.json("data:Usuario nao encontrado").status(400);
    }
    const longitude = user_result[0].location["coordinates"][0],
      latitude = user_result[0].location["coordinates"][1];
    try {
      result = await User.find({
        empresa: {
          $eq: true,
        },
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: 10000,
          },
        },
      });
    } catch (error) {
      response.json(error).status(500);
    }
    response.json(result).status(200);
  },
};
