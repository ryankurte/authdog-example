// U2F Client Side Wrapper
// Calls the standard U2F High Level Browser API
// Copyright 2016 Ryan Kurte

'use strict';

const paths = {
    u2f: {
        register: '/register',
        sign: '/sign'
    }
};

const mockRegister = {
    appId: "https://localhost:9000",
    type:"u2f_register_request",
    registerRequests:[
    {
        version:"U2F_V2",
        challenge:"NJTcQoC7uErFfoNrdWBQXW7jdJpDbVmSDV-UJNxc9IQ="
    }],
    registeredKeys:[]
}

const mockSign = {
    appId:"https://localhost:9000",
    type:"u2f_sign_request",
    challenge:"tZYYAfMkktFK3+nQiY2wqsC6cZzKkisu4rdwNptMmC8=",
    registeredKeys:[{
        version:"U2F_V2",
        keyHandle:"IREtcn_vhz04ZhXHoASHcGHIPUqVMjLheJLb97tlBHkLDUxLE_v7KIMXjKlqbAbKq4LUHbHmp6RCkr2ioCR5yw=="
    }]
}   

function U2FRegister(tokenName) {
    return new Promise(function(resolve, reject) {
        console.log("Requesting U2F registration challenge")
        $.get(paths.u2f.register, {tokenName: tokenName}, requestCallback);

        function requestCallback(data) {
            console.log("Challenge:")
            console.log(data);
            console.log("Waiting for U2F input");
            u2f.register(data.appId, data.registerRequests, data.registeredKeys, registerCallback, 10);
        }

        function registerCallback(res) {
            if(typeof res.errorCode !== 'undefined') {
                if(res.errorCode == u2f.ErrorCodes.TIMEOUT) {
                    return reject('Timed out waiting for user input');
                } else if(res.errorCode == u2f.ErrorCodes.BAD_REQUEST) {
                    return reject('Bad U2F Request');
                } else if(res.errorCode == u2f.ErrorCodes.DEVICE_INELIGIBLE) {
                    return reject('Device ineligible');
                } else {
                    return reject('Unknown error: ' + res.errorCode);
                }
            }

            console.log("Posting U2F registration response")
            $.post(paths.u2f.register, res, responseCallback);
        }

        function responseCallback(data) {
            if(typeof data.error !== 'undefined') {
                console.log("Error: " + data.error);
                return reject(data.error);
            }
            console.log("U2F enrolment complete");
            console.log(data);
            resolve(data);
        }
    });
}

function U2FSign() {
    return new Promise(function(resolve, reject) {
        console.log("Requesting U2F signing challenge")
        $.get(paths.u2f.sign, {}, requestCallback);

        function requestCallback(data) {
            console.log("Challenge:")
            console.log(data);
            console.log("Waiting for U2F input");
            u2f.sign(data.appId, data.challenge, data.registeredKeys, signatureCallback, 10);
        }

        function signatureCallback(res) {
            if(typeof res.errorCode !== 'undefined') {
                if(res.errorCode == u2f.ErrorCodes.TIMEOUT) {
                    return reject('Timed out waiting for user input');
                } else if(res.errorCode == u2f.ErrorCodes.BAD_REQUEST) {
                    return reject('Bad U2F Request');
                } else if(res.errorCode == u2f.ErrorCodes.DEVICE_INELIGIBLE) {
                    return reject('Device ineligible');
                } else {
                    return reject('Unknown error: ' + res.errorCode);
                }
            }

            console.log("Posting U2F signature response")
            $.post(paths.u2f.sign, res, responseCallback);
        }

        function responseCallback(data) {
            if(typeof data.error !== 'undefined') {
                console.log("Error: " + data.error);
                return reject(data.error);
            }
            console.log("U2F signing complete");
            console.log(data);
            resolve(data);
        }
    });
}



