const express=require('express');
const mongoose=require('mongoose');
require('dotenv').config();
const port=process.env.PORT;
const app=express();


// mongoose.connect(process.env.DATABASE_URL)
// .then(()=>console.log("connected to database"))
// .catch((err)=>console.log("database is not connected",err));;;
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("connection is successfully"))
    .catch((err) => console.log("database is not connected", err))


const userRoute=require("./Router/userRoute");
app.use("/user",userRoute);


app.listen(port,()=>console.log("server is running on port",port))