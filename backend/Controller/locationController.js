const countryModel = require("../Model/Country");
const stateModel = require("../Model/State");
const districtModel = require("../Model/District");
const { Country, State, City } = require("country-state-city");

exports.getCountries = (req, res) => {
    try {
        const countries = Country.getAllCountries();
        res.status(200).json(countries);
    } catch (error) {
        res.status(500).json({ message: "Error fetching countries", error });
    }
};

exports.getStates = (req, res) => {
    const { countryCode } = req.params;
    try {
        const states = State.getStatesOfCountry(countryCode);
        res.status(200).json(states);
    } catch (error) {
        res.status(500).json({ message: "Error fetching states", error });
    }
};

exports.getCities = (req, res) => {
    const { countryCode, stateCode } = req.params;
    try {
        const cities = City.getCitiesOfState(countryCode, stateCode);
        res.status(200).json(cities);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cities", error });
    }
};