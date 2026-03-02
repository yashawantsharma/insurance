const express=require('express');
const mongoose=require('mongoose');
const cors = require('cors')
require('dotenv').config();
const port=process.env.PORT;
const app=express();


// mongoose.connect(process.env.DATABASE_URL)
// .then(()=>console.log("connected to database"))
// .catch((err)=>console.log("database is not connected",err));;;
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("connection is successfully"))
    .catch((err) => console.log("database is not connected", err))

const fileUpload = require("express-fileupload");
app.use(fileUpload());
app.use(express.json());
app.use(cors());

const userRoute=require("./Router/userRouter");
app.use("/user",userRoute);
const locationRoute=require("./Router/location");
app.use("/location",locationRoute);
const policeRoute=require("./Router/policeRouter");
app.use("/police",policeRoute);
const agentRoute=require("./Router/agentRoute");
app.use("/Agent",agentRoute);
const branchRoute=require("./Router/branchRoute");
app.use("/branch",branchRoute);
const countryRoute=require("./Router/countryRoute");
app.use("/Country",countryRoute);
const stateRoute=require("./Router/stateRoute");
app.use("/State",stateRoute);


app.listen(port,()=>console.log("server is running on port",port))