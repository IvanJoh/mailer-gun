//IMPORTS
const globalContext = require('./config/globalcontext');


//VARIABLES
const stop = message => {
    //Logs a message and stops the process
    console.log('Stopping script here...');
    if (message) console.log(message);
    process.exit();
}


//EXPORTS
exports.delay = ms => {
    //This function delays the process for the specified time
    ms = ms || 200;
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.lineBreak = () => {
    console.log();
    console.log();
    return
}

exports.stop = stop;

exports.eject = err => {
    console.log(err);
    stop(`There was an error and the script could not complete successfully: ${err}`);
}

exports.mergeContext = vars => {
    //Returns the combined context for the email template
    vars = vars || {};
    return {
        ...globalContext,
        ...vars
    }
}

exports.convertMSToHMS = ms => {
    ms = parseInt(ms || 0);

    let h = Math.floor(ms / (1000 * 60 * 60));
    let m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    let s = Math.floor((ms % (1000 * 60)) / 1000);

    return `${h}h${m}m${s}s`;
}