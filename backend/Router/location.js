const express =require("express");
const route = express.Router();

const locationController = require("../Controller/locationController")

route.get("/countries", locationController.getCountries);
route.get("/states/:countryCode", locationController.getStates);
route.get("/cities/:countryCode/:stateCode", locationController.getCities);   

route.get("/countri", locationController.getallCountries);
route.get("/states", locationController.getStatesByCountry);
route.get("/cities", locationController.getCitiesByState)





module.exports = route