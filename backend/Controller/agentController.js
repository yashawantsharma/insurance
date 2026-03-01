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
        const userdata=new user({
            name:fullName,
            email,
            phone,
            password:hash,
            role:"agent"
        })
        await userdata.save()
        res.status(201).json({ message: "Agent added successfully", agent: newAgent });
    } catch (error) {
        console.error("Error adding agent:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




exports.getAllAgent = async (req, res) => {
    try {
        const agents = await agent.find();
        res.status(200).json( agents );
    }
    catch (error) {
        console.error("Error fetching agents:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getAgentById = async (req, res) => {
    try {
        const agentId = req.params.id;
        const foundAgent = await agent.findById(agentId);
        if (!foundAgent) {
            return res.status(404).json({ message: "Agent not found" });
        }
        res.status(200).json(foundAgent);
    } catch (error) {
        console.error("Error fetching agent:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.updateAgent = async (req, res) => {
    try {
        const {id} = req.params;
        const updateData = req.body;
        const updatedAgent = await agent.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedAgent) {
            return res.status(404).json({ message: "Agent not found" });
        }
        res.status(200).json({ message: "Agent updated successfully", agent: updatedAgent });
    } catch (error) {
        console.error("Error updating agent:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



exports.deleteAgent = async (req, res) => {
    try {
        const {id} = req.params;
        const deletedAgent = await agent.findByIdAndDelete(id);
        if (!deletedAgent) {
            return res.status(404).json({ message: "Agent not found" });
        }
        res.status(200).json({ message: "Agent deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting agent:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

