/**
 * 
 * mailer-gun
 * 
 * Script to flexibly send bulk emails using Mailgun
 * 
 * Copyright © 2022 Ivan Johannes
 * 
 */

//IMPORTS
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const handlebars = require("handlebars");
const { stop, lineBreak, delay, eject, convertMSToHMS, mergeContext } = require('./functions');
const config = require('./config/main');
const transporter = require('./transporter');
const attachments = require('./attachments');

//VARIABLES
let globals = {};
let contexts;
let log = [];

//TEMPLATES
let template_email;
let template_header;
let template_footer;
let template_body;

const getbatchSize = async () => {
    // PROMPS THE USER TO SET THE BATCH SIZE
    try {
        lineBreak();
        await delay(500);

        //GET USER INPUT
        let response = await prompts({
            type: 'text',
            name: 'batchSize',
            message: 'How many emails should be sent at a time? (Please enter a number)'
        });

        //RETRY FUNCTION
        const retry = async res => {
            lineBreak();
            await delay(200);
            console.log(`${res} is not a positive number...`);
            lineBreak();
            await delay(200); 
            console.log('Please make sure to enter a positive number...');
            return await getbatchSize();
        }

        //USER EXITED THE PROCESS
        if (!response.batchSize) stop();

        //USER ENTERED SOMETHING OTHER THAN A NUMBER
        if (isNaN(response.batchSize)) await retry(response.batchSize);

        //USER ENTERED A NON-POSITIVE NUMBER
        if (response.batchSize <= 0) await retry(response.batchSize);

        //SET BATCH SIZE
        globals.batchSize = parseInt(response.batchSize);

        return;

    } catch (error) {
        eject(error);
    }
}

const getIntervalSize = async () => {
    // PROMPTS THE USER TO SET THE DELAY BETWEEN BATCHES
    try {
        lineBreak();
        await delay(500);
        
        //GET USER INPUT
        let response = await prompts({
            type: 'text',
            name: 'intervalSize',
            message: 'How many ms to wait between email sends? (Please enter a number)'
        });

        //RETRY FUNCTION
        const retry = async res => {
            lineBreak();
            await delay(200);
            console.log(`${res} is not a positive number...`);
            lineBreak();
            await delay(200); 
            console.log('Please make sure to enter a positive number...');
            return await getIntervalSize();
        }

        //USER EXITED PROCESS
        if (!response.intervalSize) stop();

        //USER ENTERED SOMETHING OTHER THAN A NUMBER
        if (isNaN(response.intervalSize)) await retry(response.intervalSize);

        //USER ENTERED A NEGATIVE NUMBER
        if (response.intervalSize < 0) await retry(response.intervalSize);

        //SET THE DELAY
        globals.intervalSize = parseInt(response.intervalSize);

        return;

    } catch (error) {
        eject(error);
    }
}

const parseContexts = async () => {
    try {
        lineBreak();
        await delay(500);

        //RAW DATA
        let _contexts = fs.readFileSync(path.join(__dirname, "./config/contexts.json"));
        contexts = await JSON.parse(_contexts);

        //USER UPDATE
        let num_contexts = contexts.length;
        console.log(`Found ${num_contexts} email/s to send...`);

        await getbatchSize();//SEE ABOVE
        await getIntervalSize();//SEE ABOVE

        //A BIT OF MATH
        let num_batches = Math.ceil(num_contexts/globals.batchSize);
        let estimatedTime = convertMSToHMS(num_batches * (globals.intervalSize + (globals.batchSize * 500)));
        
        //ESTIMATED TIME TO COMPLETION
        lineBreak();
        console.log(`Expected time to completion : ${estimatedTime}`);
        lineBreak();

        //CONFIRM EMAILS SEND
        const getResponse = async () => {
            lineBreak();
            await delay(200);

            //USER INPUT
            let response = await prompts({
                type: 'text',
                name: 'goAhead',
                message: `Are you ready to send ${num_contexts} email/s in ${num_batches} batch/s? (yes|no)`
            });

            //USER EXITED PROCESS
            if (!response.goAhead) return stop();
    
            //WRONG USER INPUT
            if (!['no', 'yes'].includes(response.goAhead)) {
                lineBreak();
                await delay(200);
                console.log("Please enter 'yes' or 'no'...");
                return await getResponse();
            }

            //USER STOPPED PROCESS
            if (response.goAhead === 'no') return stop();

            return;
        }

        return await getResponse();

    } catch (error) {
        eject(error)
    }
}

const sendMail = async body => {

    //DESTRUCTURE BODY    
    let { 
        sendee,
        content
    } = body;
    
    try {

        lineBreak();
        console.log(`Sending an email to ${sendee}...`);
        
        //BASE OPTIONS
        let mailOptions = {
            from: config.script.SEND_FROM_EMAIL || "ivan@ivanjohannes.com",
            subject: config.script.SUBJECT || "MAILER-GUN TEST EMAIL",
            to: sendee
        }

        //BUILD EMAIL FROM TEMPLATE OR RAW TEXT
        if (config.script.CONTENT_TYPE === "template") {

            const htmlToSend = handlebars.compile(template_email)({
                ...content
            });

            mailOptions.html = htmlToSend
            mailOptions.attachments = attachments
        } else {
            mailOptions.text = config.script.TEXT
        }
        
        //MAILGUN
        await transporter.sendMail(mailOptions);
        
        return {
            success: true,
            content,
            sendee
        }
    } catch (error) {
        return {
            success: false,
            error,
            content,
            sendee
        }
    }
}

const sendBatches = async () => {
    try {

        lineBreak();
        await delay(globals.intervalSize);

        //GET EMAIL CONTEXTS
        let batch = contexts.slice(0, globals.batchSize);
        console.log(`Sending a new batch of ${batch.length} email/s...`);

        //LOOP THROUGH BATCH
        for (let e of batch) {
            try {
                let { context, email } = e;

                context = context || {};

                let content = mergeContext(context);

                let result = await sendMail({
                    content,
                    sendee: email
                });

                //BUILD LOG OBJECT
                log.push(result);
                contexts = contexts.slice(1);

            } catch (error) {
                console.log(error)
                contexts = contexts.slice(1);
                continue
            }
        }

        if (contexts.length > 0) return await sendBatches();

        return;

    } catch (error) {
        console.log(error)
        eject(error);
    }

}

const script = async () => {
    try {

        console.log("Starting the email script...");
        lineBreak();
        await delay(500);
        console.log("Hit (ctrl+C) at any time to stop the process...");

        if (config.script.CONTENT_TYPE === "template") {
            //SET TEMPLATES
            template_email = fs.readFileSync(path.join(__dirname, './templates/_email.hbs'), "utf8");
            template_header = fs.readFileSync(path.join(__dirname, './templates/_header.hbs'), "utf8");
            template_footer = fs.readFileSync(path.join(__dirname, './templates/_footer.hbs'), "utf8");
            template_body = config.script.TEMPLATE && fs.readFileSync(path.join(__dirname, './templates/', `${config.script.TEMPLATE}.hbs`), "utf8");

            if (!template_email || !template_header || !template_footer) throw new Error("Could not find the right email templates");
    
            //REGISTER TEMPLATE PARTIALS
            handlebars.registerPartial('header', handlebars.compile(template_header));
            handlebars.registerPartial('footer', handlebars.compile(template_footer));
            handlebars.registerPartial('body', handlebars.compile(template_body));
        }
        

        await parseContexts();
        await sendBatches();

        let curDate = new Date().toString();
        let file_path = path.resolve(__dirname, `./logs/${curDate}.json`);
        fs.writeFileSync(file_path, JSON.stringify({
            globalContext: require('./config/globalcontext'),
            script_config: config.script,
            log
        }));
        
        stop()
        
    } catch (error) {
        console.log(error);
        eject(error)    
    }
}

script();