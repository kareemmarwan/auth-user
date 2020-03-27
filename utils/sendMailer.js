const nodemailer = require("nodemailer");
const User = require("../modiles/User");
const crypto = require("crypto-random-string");

//
module.exports = async (email)=>{
const code = crypto({ length: 4 });
console.log(process.env.EMAIL)
const transporter =  nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: '',
    pass: ''
  }
});

// const getPasswordResetURL = (user, token) => {
//   `http://localhost:3000/password/reset/${user._id}/${token}`;
// };

const sendEmail = await transporter.sendMail({
    from : process.env.EMAIL,
    to : email,
    subject : 'forget password',
    text : " your code ",
    html : `<b>${code}</b>`
});


let user = await User.findOneAndUpdate({email : email},{code:code});
    return sendEmail;


}
