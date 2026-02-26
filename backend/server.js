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

app.use(express.json());
app.use(cors());

const userRoute=require("./Router/userRouter");
app.use("/user",userRoute);


app.listen(port,()=>console.log("server is running on port",port))