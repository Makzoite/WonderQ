const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages');

//create new message
router.post('/', messagesController.messages_createMessage);

module.exports = router;