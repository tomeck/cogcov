# Node.js Hello World Sample

This application demonstrates a simple, reusable Node.js web application based on the Express framework.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/IBM-Bluemix/nodejs-helloworld)

## Run the app locally

1. [Install Node.js][]
+ cd into this project's root directory
+ Run `npm install` to install the app's dependencies
+ Run `npm start` to start the app
+ Access the running app in a browser at <http://localhost:6001>

[Install Node.js]: https://nodejs.org/en/download/

## Twilio integration

Copy the URL and paste it PLUS "/SMS" into the Webhook POST handler for Messages
for the phone number on Twilio

Send an SMS to the Twilio number

The webhook handler will receive FORM-URLENCODED data like this:

ToCountry=US&ToState=NJ&SmsMessageSid=SMedbc692d9f072246566a5b8c9f69c312&NumMedia=0&ToCity=LONG+BRANCH&FromZip=07734&SmsSid=SMedbc692d9f072246566a5b8c9f69c312&FromState=NJ&SmsStatus=received&FromCity=LONG+BRANCH&Body=Test&FromCountry=US&To=%2B17327599154&ToZip=07764&NumSegments=1&MessageSid=SMedbc692d9f072246566a5b8c9f69c312&AccountSid=ACbb28e740dadc52c2575f545b1d544b83&From=%2B17322335390&ApiVersion=2010-04-01

A sample curl script that works is:
$ curl --data "ToCountry=US&ToState=NJ&SmsMessageSid=SMedbc692d9f072246566a5b8c9f69c312&NumMedia=0&ToCity=LONG+BRANCH&FromZip=07734&SmsSid=SMedbc692d9f072246566a5b8c9f69c312&FromState=NJ&SmsStatus=received&FromCity=LONG+BRANCH&Body=Test&FromCountry=US&To=%2B17327599154&ToZip=07764&NumSegments=1&MessageSid=SMedbc692d9f072246566a5b8c9f69c312&AccountSid=ACbb28e740dadc52c2575f545b1d544b83&From=%2B17322335390&ApiVersion=2010-04-01" localhost:1337/sms
