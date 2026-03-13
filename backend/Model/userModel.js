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
  },
    agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent"
  },
     profileImage: {
        type: String,
        default: null
    },
     dateOfBirth: {
        type: Date
    },
       fatherName: {
        type: String,
        default: ""
    },
    motherName: {
        type: String,
        default: ""
    },
    aadhaarNumber: {
      type: String,
      required: true,
    },

    aadhaarImage: {
      type: String,
      required: true,
    },



});


// module.exports = mongoose.model('user', user)
module.exports = mongoose.models.user || mongoose.model("user",user)