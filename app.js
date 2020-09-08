const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');

//Routes for the messages
const messageRoutes = require('./api/routes/messages');

//morgan logs the request to the API
app.use(morgan('dev'));

//parse the parameter in json format after reading from the body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser()); //cookie to save uuid in the cookie and to retrieve from the cookie
app.use(function (req, res, next) {
    // check if client sent cookie
    const exuuid = req.cookies.uuid;
    if (exuuid === undefined) {
        // now set a new cookie
        const uuid = uuidv4() //uuid is the random unique id for consumer to represent each consumer
        res.cookie('uuid', uuid, { maxAge: 900000, httpOnly: true });
    }
    next();
});

//default path for the messages route
app.use('/', messageRoutes);

//handling the invalid request
app.use((req, res, next) => {
    const error = new Error('Not found!');
    error.status = 404;
    next(error);
});


//return message in json if error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;