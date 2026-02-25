const mongoose = require('mongoose')


const user = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: false,
    },
    password: {
        type: String,
        required: true
    },
    gender:{
        type:String,
        require:true
    },
    theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light"
    },
     resetOtp: {
        type: String
    },
    otpExpire: {
        type: Date
    },
    role: {
    type: String,
    enum: ["admin", "user", "agent"],
    default: "user"
  }

});

module.exports = mongoose.model('user', user)