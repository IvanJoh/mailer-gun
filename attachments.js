/**
 * 
 * This is where you add all the attachments that you want to add to email
 * 
 * It is particularly useful for attaching images to emails for styling etc.
 * 
 */

//IMPORTS
const fs = require('fs');
const path = require('path');

//EXPORTS
module.exports = [
    {
        cid: 'footer_facebook',
        content: fs.readFileSync(path.join(__dirname, './assets/images/emailFooterFacebook.png'), 'base64'),
        encoding: 'base64'
    },
    {
        cid: 'footer_instagram',
        content: fs.readFileSync(path.join(__dirname, './assets/images/emailFooterInstagram.png'), 'base64'),
        encoding: 'base64'
    },
    {
        cid: 'footer_linkedin',
        content: fs.readFileSync(path.join(__dirname, './assets/images/emailFooterLinkedin.png'), 'base64'),
        encoding: 'base64'
    }
]