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




// exports.addcountries=async(req,res)=>{
// try {
//     const {countryname}=req.body
//     console.log(countryname)
//     if(!countryname){
//         res.states(400).json({message:"country not found"})
//     }
//     const existingcountry=await countryModel.findOne({countryname})
//     if(!existingcountry){
//          res.states(400).json({message:"country are alredy existing"})
//     }
//     const newcountry=new countryModel({countryModel})
//      res.states(200).json(newcountry)
// } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
    
// }
// }






exports.getallCountries = async (req, res) => {
  try {
    const countries = await countryModel.find();
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get states by countryId
exports.getStatesByCountry = async (req, res) => {
  try {
    // const { countryId } = req.params;

    const states = await stateModel.find();
    res.status(200).json(states);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cities by stateId
exports.getCitiesByState = async (req, res) => {
  try {
    // const { stateId } = req.params;

    const cities = await districtModel.find();
    res.status(200).json(cities);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





