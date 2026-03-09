const countryModel=require("../Model/Country")

exports.addcountries = async (req, res) => {
  try {
    const  { countryname } = req.body;

    if (!countryname) {
      return res.status(400).json({
        message: "Country name is required",
      });
    }
     const newname = countryname.trim().toLowerCase();
    const existingcountry = await countryModel.findOne({
      countryname:newname,
    });

    
    if (existingcountry) {
      return res.status(200).json(existingcountry);
    }


    const newcountry = new countryModel({
      countryname:newname,
    });

    await newcountry.save();

    res.status(201).json({
      message: "Country added successfully",
      data: newcountry,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
