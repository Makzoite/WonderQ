const dbMessages = require('../models/message');

let id = 0; //for value increment to make unique message and producer ID.
let timeOut = null; //for reseting timeOut on polling again
//POST : Create message and push in array buffer
//req contains parameters for the input
exports.messages_createMessage = (req, res, next) => {
    const messageId = "message" + id;
    const producerId = "producer" + id; //producer id generated just for logging
    let status = "";
    let success = false;
    let message = [];
    const messageSize = Buffer.byteLength(req.body.message, 'utf8');//get the size of input message string
    console.log(messageSize);
    //Validation for message body.
    if (req.body.message !== undefined && req.body.message !== "" && messageSize < 262144) { //check if message size is greater than 256 kilobytes
        message = {
            messageID: messageId,
            message: req.body.message,
            producerID: producerId,
            status: 0, //status 0 is for available to poll and 1 for not available
            uuid: ""
        }
        dbMessages.push(message);
        id++;
        status = "Message creation successful.";
        success = true;
    }
    else {
        if (messageSize > 2)
            status = "Message size is larger than 256Kb";
        else
            status = "Please enter the message."
        success = false;
    }

    res.status(200).json({
        message: status,
        data: message,
        success: success
    });
};

//GET: Fetch all availble messages which are not polled by any other consumers.
exports.messages_availableMessages = (req, res, next) => {
    const messages = dbMessages;
    const availableMessages = []; //temp array
    messages.forEach(message => {
        if (message.status == 0) {
            availableMessages.push(message); //push available messages in temp array
        }
    });
    res.status(200).json({
        message: 'Available messages loaded',
        data: availableMessages
    });
};

//GET: Poll the messages from the WonderQ
exports.messages_getMessages = (req, res, next) => {
    const messages = dbMessages;
    const polledMessages = []; //temp array
    messages.forEach(message => {
        if (message.status == 0) {
            message.status = 1; //update the message status to 1 so that other could not access this message
            message.uuid = req.cookies.uuid; //Set session specific uuid for each consumer
            polledMessages.push(message);
        }
    });
    //If the messages is polled again then clear the previos timeout
    if (timeOut != null) {
        clearTimeout(timeOut);
    }

    //Set the timeout to trigger after configurable display timeout to make messages available to other consumers
    timeOut = setTimeout(() => {
        messages.forEach(message => {
            if (message.uuid == req.cookies.uuid) {
                //reset status of message to 0 and uuid empty after display timeout exceeds
                message.status = 0; 
                message.uuid = "";
            }
        });
    }, process.env.DISPLAY_TIMEOUT); 

    res.status(200).json({
        message: 'Messages polling success',
        data: polledMessages,
        timeout: process.env.DISPLAY_TIMEOUT
    });
};

//GET: Handle the polled messages display on reload
exports.messages_loadMessages = (req, res, next) => {
    const messages = dbMessages;
    const polledMessages = []; //temp array for polled messages
    messages.forEach(message => {
        if (message.uuid == req.cookies.uuid) {
            polledMessages.push(message);
        }
    });
    res.status(200).json({
        message: 'Reloaded polled messages',
        data: polledMessages,
        timeout: process.env.DISPLAY_TIMEOUT
    });
};

//DELETE: Delete the selected messageId and check the uuid for display timeout.
//If no uuid present then do not delete as polling messages is expired and could be polled by other consumer
exports.messages_deleteMessage = (req, res, next) => {
    const messageID = req.params.id;
    const status = deleteMessage(messageID, req.cookies.uuid);
    let message = "";
    if (status)
        message = "Deletion successful";
    else
        message = "The selected message could not be deleted.";
    res.status(200).json({
        message: message,
        success: status,
        messageID: messageID
    });
};

//Deletes message from the array
// Params: messageId: received from the user input
//         uuid: extracted from the saved cookie
function deleteMessage(messageId, uuid) {
    let success = false;
    dbMessages.forEach((message, index) => {
        console.log(message.messageID);
        if (message.messageID === messageId && message.uuid === uuid) {//delete message only if uuid is available
            dbMessages.splice(index, 1);
            success = true;
        }
    });
    return success;
};