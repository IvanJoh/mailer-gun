//IMPORTS
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const config = require('./config/main');


//VARIABLES
const { credentials } = config;
const { 
    MAILGUN_API_KEY,
    MAILGUN_DOMAIN_NAME
} = credentials;


//AUTH OBJECT
const mailgunAuth = {
    auth: {
        api_key: MAILGUN_API_KEY,
        domain: MAILGUN_DOMAIN_NAME
    }
};


//TRANSPORT
const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));


//EXPORTS
module.exports = smtpTransport;