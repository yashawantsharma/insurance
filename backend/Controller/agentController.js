const agent = require("../Model/agentModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const creareimage=require("../Utility/cloud").uploadImage
const user = require("../Model/userModel");

function generatePassword(length = 4) {
    const chars = "0123456789";

    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
}

exports.addAgent = async (req, res) => {
    try {

         const file =req.files
        // console.log(file);
        const data1 =await  creareimage(file)
        const finalimage=data1[0].url;
        const { fullName, email, phone, education, aadhaarNumber, aadhaarImage, profileImage, address, joiningDate, experienceYears } = req.body;

        // if(!fullName || !email || !phone || !education || !aadhaarNumber || !aadhaarImage || !profileImage || !address || !joiningDate || !experienceYears){
        //     return res.status(400).json({ message: "All fields are required" });
        // }
        // console.log(req.body);
        const existingAgent = await agent.findOne({ email });
        if (existingAgent) {
            return res.status(400).json({ message: "Agent with this email already exists" });
        }
        const password = generatePassword();
         const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt);

        const newAgent = new agent({
            fullName,
            email,
            phone,
            password: hash,
            education,
            aadhaarNumber,
            aadhaarImage: finalimage,
            profileImage: finalimage,
            address,
            joiningDate,
            experienceYears,
        });
        // console.log(newAgent);
        await newAgent.save();
        res.status(201).json({ message: "Agent added successfully", agent: newAgent });
    } catch (error) {
        console.error("Error adding agent:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

