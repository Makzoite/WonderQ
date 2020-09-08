const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages');

//create new message
router.post('/', messagesController.messages_createMessage);

//get all the available messages
router.get('/messages/available', messagesController.messages_availableMessages);

//poll all the available messages
router.get('/messages/poll', messagesController.messages_getMessages);

//get all the polled messages
router.get('/messages', messagesController.messages_loadMessages);

//delete the message
router.delete('/message/:id', messagesController.messages_deleteMessage);

module.exports = router;
