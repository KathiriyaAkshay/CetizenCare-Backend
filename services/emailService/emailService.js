const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');

exports.sendEmailVarification = async (options)=>{
  const { email, subject, message } = options
  // console.log(`Sending email with otp: ${otp} to ${email}`);
  var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });
    
  const handlebarOptions = {
    viewEngine:{
      extName: ".html",
      partialsDir: path.resolve('.views'),
      defaultLayout : false,
    },
    viewPath: path.join(__dirname,'./views'),
    extName: '.handlebars',
  }

  transporter.use('compile', hbs(handlebarOptions));

    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject,
      template:'emailVerification',
      context:{
        message
      },
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        return error;
      } else {
        return info;
      }
    });
} 

exports.sendResetPaswordEmail = async (options)=>{
    const { email, subject, resetLink } = options
    // console.log(`Sending email with otp: ${otp} to ${email}`);
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS
        }
      });
      
    const handlebarOptions = {
      viewEngine:{
        extName: ".html",
        partialsDir: path.resolve('.views'),
        defaultLayout : false,
      },
      viewPath: path.join(__dirname,'./views'),
      extName: '.handlebars',
    }

    transporter.use('compile', hbs(handlebarOptions));

      var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject,
        template:'resetPassword',
        context:{
          resetLink 
        },
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return error;
        } else {
        //   console.log('Email sent: ' + info.response);
          return info;
        }
      });
} 

exports.accountVerified = async options => {
  const { email, subject } = options
  // console.log(`Sending email with otp: ${otp} to ${email}`);
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  })

  const handlebarOptions = {
    viewEngine: {
      extName: '.html',
      partialsDir: path.resolve('.views'),
      defaultLayout: false
    },
    viewPath: path.join(__dirname, './views'),
    extName: '.handlebars'
  }

  transporter.use('compile', hbs(handlebarOptions))

  var mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject,
    template: 'accountVerified',
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return error
    } else {
      return info
    }
  })
}


// exports.resetPasswordMail = async (email, token)=>{
//   console.log(`Sending email with otp: ${otp} to ${email}`);
//   var transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'akshaykathiriya789@gmail.com',
//         pass: process.env.EMAIL_PASS
//       }
//     });
    
//     var mailOptions = {
//       from: 'akshaykathiriya789@gmail.com',
//       to: email,
//       subject: 'Verification for register via email in CetizenCare',
//       html: `<p>This is your otp : <b>${otp}</b></p>`
//     };
    
//     transporter.sendMail(mailOptions, function(error, info){
//       if (error) {
//         console.log(error);
//         return error;
//       } else {
//         console.log('Email sent: ' + info.response);
//         return info;
//       }
//     });
// }
