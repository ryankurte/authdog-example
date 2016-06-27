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

function U2FRegister(tokenName) {
    return new Promise(function(resolve, reject) {
        console.log("Requesting U2F registration challenge")
        $.get(paths.u2f.register, {tokenName: tokenName}, requestCallback);

        function requestCallback(data) {
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
            resolve(data);
        }
    });
}

function U2FSign() {
    return new Promise(function(resolve, reject) {
        console.log("Requesting U2F signing challenge")
        $.get(paths.u2f.sign, {}, requestCallback);

        function requestCallback(data) {
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
            resolve(data);
        }
    });
}



