const express =require("express");
const route = express.Router();

const locationController = require("../Controller/locationController")

route.get("/countries", locationController.getCountries);
route.get("/states/:countryCode", locationController.getStates);
route.get("/cities/:countryCode/:stateCode", locationController.getCities);   




module.exports = route;