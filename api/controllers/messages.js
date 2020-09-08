const dbMessages = require('../models/message');

let id = 0;

//POST : Create message and push in array buffer
exports.messages_createMessage = (req, res, next) => {
    const messageId = "message" + id;
    const producerId = "producer" + id; //random producer generated just for logging
    let status = "";
    let success = false;
    let message = [];
    const messageSize = Buffer.byteLength(req.body.message, 'utf8');
    console.log(messageSize);
    //Validation for message body.
    if (req.body.message !== undefined && req.body.message !== "" && messageSize < 262144) { //check if message size is greater than 256 kilobytes
        message = {
            messageID: messageId,
            message: req.body.message,
            producerID: producerId,
            status: 0,
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
