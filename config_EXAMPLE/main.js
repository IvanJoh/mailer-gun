//INIT export object
let config = {};


//CREDENTIALS
config.credentials = {};
config.credentials.MAILGUN_API_KEY = ""; //GET THIS FROM THE MAILGUN INTERFACE
config.credentials.MAILGUN_DOMAIN_NAME = ""; //SET THIS ON THE MAILGUN INTERFACE


//SCRIPT
config.script = {};
config.script.SEND_FROM_EMAIL = 'ivan@ivanjohannes.com'; //THIS IS WHAT THE RECIPIENT RECEIVES
config.script.SUBJECT = 'mailer-gun demo'; //SUBJECT
config.script.CONTENT_TYPE = "template"; // (text || template)
config.script.TEXT = "Hi there" //IF CONTENT_TYPE === "text"
config.script.TEMPLATE = "test"; //IF CONTENT_TYPE === "template"


//EXPORT
module.exports = config;