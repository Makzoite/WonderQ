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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(function (req, res, next) {
    // check if client sent cookie
    const exuuid = req.cookies.uuid;
    if (exuuid === undefined) {
        // no: set a new cookie
        const uuid = uuidv4()
        res.cookie('uuid', uuid, { maxAge: 900000, httpOnly: true });
    }
    next();
});

//default path for the messages route
app.use('/', (req, res, next) => {
    res.status(200).json({
        message: 'Yay its working!!!'
    });
});

//handling the invalid request
app.use((req, res, next) => {
    const error = new Error('Not found!');
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;