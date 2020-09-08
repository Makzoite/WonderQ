const chai = require('chai');
const chaiHttp = require('chai-http');
process.env.DISPLAY_TIMEOUT = 3000;
const app = require('../app');

//Assertion style
chai.should()

chai.use(chaiHttp);

describe('API Messages', () => {

    //404 status not found for unavailable routes
    describe('GET /', () => {
        it('It should return page not found', (done) => {
            chai.request(app)
                .get("/")
                .end((err, response) => {
                    if (!err) {
                        response.should.have.status(404);
                        response.body.should.be.a('object');
                        response.body.should.have.property('error');
                        done();
                    }
                    else {
                        console.log(err)
                    }
                });
        });
    });

    //For testing the POST response while creating the message
    describe('POST /', () => {
        const message = {
            "message": "This is test message."
        }
        const messageSize = Buffer.byteLength(message.message, 'utf8'); //get the message size in bytes
        it('It should post the message and get the confirmation.', (done) => {
            chai.request(app)
                .post("/")
                .send(message)
                .end((err, response) => {
                    if (!err) {
                        response.should.have.status(200);
                        response.body.should.have.property('message');
                        response.body.should.have.property('data');
                        response.body.should.have.property('success');
                        response.body.data.should.be.a('object');
                        response.body.data.should.have.property('messageID');
                        response.body.data.should.have.property('message');
                        response.body.data.should.have.property('producerID');
                        response.body.data.should.have.property('status').eq(0);
                        response.body.data.should.have.property('uuid').eq("");
                        if (messageSize > 262144) { //check message size and the response message
                            response.body.should.have.property('message').eq('Message size is larger than 256Kb');
                        }
                        done();
                    }
                    else {
                        console.log(err);
                    }
                });
        });
    });

    //for testing available messages for polling
    describe('GET /messages/available', () => {
        it('It should get all the available message for polling.', (done) => {
            chai.request(app)
                .get("/messages/available")
                .end((err, response) => {
                    if (!err) {
                        response.should.have.status(200);
                        response.body.should.be.a('object');
                        response.body.should.have.property('message');
                        response.body.should.have.property('data');
                        done();
                    }
                    else {
                        console.log(err);
                    }
                });
        });
    });

    // testing for polling the available messages
    describe('GET /messages/poll', () => {
        it('It should poll all the available messages.', (done) => {
            chai.request(app)
                .get("/messages/poll")
                .end((err, response) => {
                    if (!err) {
                        response.should.have.status(200);
                        response.body.should.be.a('object');
                        response.body.should.have.property('message');
                        response.body.should.have.property('data');
                        response.body.should.have.property('timeout');
                        if (response.body.data.length > 0) {
                            response.body.data.should.be.a('array');
                            response.body.data[0].should.have.property('messageID');
                            response.body.data[0].should.have.property('message');
                            response.body.data[0].should.have.property('producerID');
                            response.body.data[0].should.have.property('status').not.eq(0);
                        }
                        done();
                    }
                    else {
                        console.log(err);
                    }
                });
        });
    });

    //testing for loading polled messages
    describe('GET /messages', () => {
        it('It should fetch all polled messages.', (done) => {
            chai.request(app)
                .get("/messages")
                .end((err, response) => {
                    if (!err) {
                        response.should.have.status(200);
                        response.body.should.be.a('object');
                        response.body.should.have.property('message');
                        response.body.should.have.property('data');
                        response.body.should.have.property('timeout');
                        if (response.body.data.length > 0) {
                            response.body.data.should.be.a('array');
                            response.body.data[0].should.have.property('messageID');
                            response.body.data[0].should.have.property('message');
                            response.body.data[0].should.have.property('producerID');
                            response.body.data[0].should.have.property('status').not.eq(0);
                        }
                        done();
                    }
                    else {
                        console.log(err);
                    }
                });
        });
    });

    //testing for deleting the message
    describe('GET /message/:id', () => {
        it('It should delete message.', (done) => {
            const id = 'message0';
            chai.request(app)
                .delete("/message/" + id)
                .end((err, response) => {
                    if (!err) {
                        response.should.have.status(200);
                        response.body.should.be.a('object');
                        response.body.should.have.property('message');
                        response.body.should.have.property('success');
                        response.body.should.have.property('messageID');
                        done();
                    }
                    else {
                        console.log(err);
                    }
                });
        });
    });

});
