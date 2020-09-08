const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages');

//create new message
router.post('/', messagesController.messages_createMessage);

//get all the available messages
router.get('/messages/available', messagesController.messages_availableMessages);

module.exports = router;