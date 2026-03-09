const user = require("../Model/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");


function generatePassword(length = 4) {
    const chars = "0123456789";

    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
}

// console.log(generatePassword());

exports.register = async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, phone, gender,role } = req.body;
            if (!(name && email && phone && gender)) {
            return res.status(400).json({ message: "All input are required" });
        }
        const userExist = await user.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }
       const password = generatePassword();
         const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt);
        const data = { name, email, phone, password: hash, gender,role,agentId: req.user._id }
        const newUser = new user(data);
        await newUser.save();
         const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENT_EMAIL,
                pass: process.env.SENT_PASS,
            },
        });


        const info = await transporter.sendMail({
            from: process.env.SENT_EMAIL,
            to: email,
            subject: "Account Created successfully",
            subject: "Account Created",
            html: `
    <p>Hello <b>${name}</b>,</p>

    <p>
      Your account has been created with the following details:
    </p>

    <p>
      <b>Email:</b> ${email}<br/>
      <b>Phone:</b> ${phone}<br/>
      <b>Password:</b> ${password}
    </p>

    <p>
      Please change your password after login.
    </p>

    <p>
      Thanks,<br/>
    </p>
  `,

        });
        res.status(201).json({ message: "User registered successfully", password });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}




exports.findAll = async (req, res) => {
    try {
        const users = await user.find().populate("agentId");
        res.status(200).json(users)
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}



exports.findOne = async (req, res) => {
    try {
        const { id } = req.params;
        const existinguser = await user.findById(id);
        if (!existinguser) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).json(existinguser)
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data  = req.body;
        const existinguser = await user.findByIdAndUpdate(id, data);
        
        if (!existinguser) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).json(existinguser)
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const existinguser = await user.findByIdAndDelete(id);
        if (!existinguser) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).json({ message: "User deleted successfully" })
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
          if (!(email && password)) {
            return res.status(400).json({ message: "all input are required" });
        }
        const existinguser = await user.findOne({ email });
        
        if (!existinguser) {
            return res.status(404).json({ message: "User not found" })
        }
        // console.log(password);
        // console.log(existinguser.password);
        
        const isMatch = await bcrypt.compare(password, existinguser.password);

        if (isMatch) {
            const token = jwt.sign(
                { id: existinguser._id, role: existinguser.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

        res.status(200).json({ message: "Login successful", token: token,
                user: {
                    id: existinguser._id,
                    name: existinguser.name,
                    email: existinguser.email,
                    role: existinguser.role 
                } })
    }
}
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }   
}

exports.forgot = async (req, res) => {
     try {
        const { email, newpassword, confrompassword, otp } = req.body
        if (!(email && newpassword && confrompassword && otp)) {
            return res.status(400).json("all input are required")
        }
        if (newpassword !== confrompassword) {
            return res.status(400).json({ message: "consfrompassword not match" })
        }
        const forgetdata = await user.findOne({ email })
        if (!forgetdata) {
            return res.status(400).json({ message: "please signup first" })
        }
        if (forgetdata.resetOtp !== otp) {
            return res.status(400).json({ massage: "Invalid OTP" });
        }
        if (forgetdata.otpExpire < Date.now()) {
            return res.status(400).json({ massage: "expired OTP" });
        }
        if (email !== forgetdata.email) {
            return res.status(400).json({ message: "invelide email" })
        }
        const salt = bcrypt.genSaltSync(10)
        const hash = await bcrypt.hashSync(newpassword, salt)
        forgetdata.password = hash;
        forgetdata.resetOtp = undefined;
        forgetdata.otpExpire = undefined;
        await forgetdata.save();
        return res.status(200).json("successfully")
    } catch (error) {
        return res.status(400).json({ error: error.massage })
    }
}

exports.reset = async (req, res) => {
     try {
        const { email, oldpassword, newpassword, confrompassword } = req.body
        if (!(email && oldpassword && newpassword && confrompassword)) {
            return res.status(400).json({ message: "all input aer required" });
        }
        const resetdata = await user.findOne({ email })
        if (!resetdata) {
            return res.status(400).json({ message: "invalid email " })
        }
        const dbpasword = resetdata.password
        const isMatch = await bcrypt.compare(oldpassword, dbpasword)
        if (!isMatch) {
            return res.status(400).json({ message: "oldpassword is no match" })
        }
        if (newpassword !== confrompassword) {
            return res.status(400).json({ message: "confrompassword no match" })
        }
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(newpassword, salt)
        const handel = await user.findOneAndUpdate({ email }, { $set: { password: hash } })
        return res.status(200).json({ message: "successfully updated password" });
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}


exports.updatetheme=async(req,res)=>{
     try {
        const  {theme}  = req.body;
        console.log(req.body);
        

        if (!["light", "dark"].includes(theme)) {
            return res.status(400).json({ message: "Invalid theme value" });
        }

        const themedata = await user.findByIdAndUpdate(req.user._id, { theme });


        return res.status(200).json({
            message: "Theme updated successfully",
            theme: themedata.theme,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
        });
    }
};


exports.findTheme=async(req,res)=>{
    try {
        const userData = await user.findById(req.user._id).select("theme");

        return res.status(200).json({
            success: true,
            theme: userData.theme,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



exports.sendotp = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ massage: "Email required" });
        }
        const findemail = await user.findOne({ email })
        if (!findemail) {
            return res.status(400).json({ massage: "Please signup first" });
        }

        const otp = otpgenerato()
        findemail.resetOtp = otp;
        findemail.otpExpire = Date.now() + 5 * 60 * 1000;
        await findemail.save();
        console.log("OTP:", otp);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENT_EMAIL,
                pass: process.env.SENT_PASS,
            },
        });
        const info = await transporter.sendMail({
            from: process.env.SENT_EMAIL,
            to: email,
            subject: "forget OTP",
            text: `Hello your OTP this ${otp}`,
        });
        console.log("Message sent:", info.messageId);
        return res.status(200).json({ message: "OTP send successfully", messageId: info.messageId })
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}





exports.getOneUsers = async (req, res) => {
  try {

    const users = await user.find({
      agentId: req.user._id
    });

    res.json({users
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};