// For running an Express server to respond to the API requests
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

// For Twilio integration
var twilio = require('twilio');
// create a Twilio REST client - only needed if initiating SMS's
//var client = require('./twilio-node/lib')('ACbb28e740dadc52c2575f545b1d544b83', 'd31a27296b3b9ea2f0893cc64411198b');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// For maintaining state of a Conversation
var mcache = require('memory-cache');

// Setup Watson Conversation
var Conversation = require('watson-developer-cloud/conversation/v1');

// Get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
// JTE TODO - read Env Vars from cfenv
//var conversationUsername = vcap_services.conversation.credentials.username || 'e7628040-92ad-4a01-8415-467b78ee3110';
//var conversationPassword = vcap_services.conversation.credentials.password || 'qGz4gBDXiHHi';
var conversationUsername = 'e7628040-92ad-4a01-8415-467b78ee3110';
var conversationPassword = 'qGz4gBDXiHHi';
var conversationWorkspace = 'd0b8c93b-f4f2-4689-b980-3cedfb519d0d'// 'ba1d1b65-2ce5-4901-8377-2de214dea244';

// Create the service wrapper
var conversation = new Conversation({
  username: conversationUsername,
  password: conversationPassword,
  version_date: Conversation.VERSION_DATE_2017_02_03
});
// End Watson Conversation

// Setup the Express application instance
var app = express();
// parse application/json
//app.use(bodyParser.json());
//app.use(bodyParser.text());
app.use( bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.raw());

// Use this to get the entire body in raw format
//app.use(bodyParser.text({type: '*/*'}));

// API call demonstrating HTTP GET action
app.get('/sms', function(req, res) {
    res.send('Hello World');
  }
);

// Twilio will POST to the /sms resource when it receives an SMS message
app.post('/sms', function(req, res) {
  /*
  var workspace = process.env.WORKSPACE_ID || conversationWorkspace;
  if (!workspace || workspace === conversationWorkspace) {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  */

  //console.log('Content-Type: ' + req.headers['content-type']);

  // FORM-URLENCODED as per Twilio POST format
  var phoneNum = req.body.From;
  var inBody = req.body.Body;

  console.log('-----------------');
  console.log('Input received: ' + inBody + ' from ' + phoneNum );

  // Get the Watson Conversation id associated with the source phone number
  var ctxt = mcache.get(phoneNum) || null;

  if( ctxt != null ) {
    console.log('Context found for ' + phoneNum);
  }
  else {
    console.log('No context found for ' + phoneNum);
  }

  // Send the input to the conversation service
  conversation.message({
      input: { text: inBody },
      context : ctxt,
      workspace_id: conversationWorkspace
    }, function(err, data) {
      var responseMsg;
      if (err) {
        console.error('Something bad happened: ' + JSON.stringify(err, null, 2));
        responseMsg = JSON.stringify(err, null, 2)
      } else {

        // Extract response returned by Watson
        responseMsg = data.output.text[0];

        var firstIntent = (data.intents != null && data.intents.length>0 ) ? data.intents[0] : null;
        var intentName = (firstIntent != null) ? firstIntent.intent : "";
        var intentConfidence = (firstIntent != null) ? firstIntent.confidence : "";

        var firstEntity = (data.entities != null && data.entities.length>0 ) ? data.entities[0] : null;
        var entityName = (firstEntity != null) ? firstEntity.entity : "";
        var entityValue= (firstEntity != null) ? firstEntity.value : "";

        var conversationId = data.context.conversation_id;
        console.log('Detected intent {' + intentName + '} with confidence ' + intentConfidence);
        console.log('Detected entity {' + entityName + '} with value {' + entityValue + "}");
        console.log('Conversation id = ' + conversationId);
        console.log('Response will be: ' + responseMsg);
        console.log(data);
        //console.log(data.context);

        // JTE TODO - get Watson Conversation context working
        // so that we key off context.action here
        if( "place_order" == intentName && firstEntity != null ) {
          console.log('*** ACTION: Place order for ' + entityValue );
          mcache.del(phoneNum);
          console.log('Context cleared for ' + phoneNum );
        }
        else {
          // Store updated context if the
          // conversation is not complete
          mcache.put(phoneNum,data.context);
          console.log('Context set for ' + phoneNum );
        }
      }

      // Compose the response to Twilio that will be SMS'd back to originator
      var twiml = new twilio.TwimlResponse();
      twiml.message(responseMsg);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());

      console.log("Wrote message back to Twilio");
      console.log('-----------------');
  });
});

// Start server on host and port specified in CF config
// or Express defaults when running locally
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});



/*
//Send an text message
client.sendMessage({

    to: '+17322335390', // Any number Twilio can deliver to
    from: '+17327599154', // A number you bought from Twilio and can use for outbound communication
    body: 'word to your mother.' // body of the SMS message

}, function(err, responseData) { //this function is executed when a response is received from Twilio
    if (!err) { // "err" is an error received during the request, if any

        // "responseData" is a JavaScript object containing data received from Twilio.
        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

        console.log(responseData.from); // outputs "+14506667788"
        console.log(responseData.body); // outputs "word to your mother."
    }
});

//Send a message with content (MMS)
client.messages.post({

    to: '+17322335390', // Any number Twilio can deliver to
    from: '+17327599154', // A number you bought from Twilio and can use for outbound communication
    body: 'Kind sir, won\'t you instruct me how to douglas?',
    mediaUrl: 'http://25.media.tumblr.com/tumblr_lx5lqyG19e1qaa7gwo1_400.jpg'

}, function (err, responseData) {

    console.log(responseData);

});


//Place a phone call, and respond with TwiML instructions from the given URL
client.makeCall({

    to: '+17322335390', // Any number Twilio can call
    from: '+17327599154', // A number you bought from Twilio and can use for outbound communication
    url: 'http://www.example.com/twiml.php' // A URL that produces an XML document (TwiML) which contains instructions for the call

}, function(err, responseData) {

    //executed when the call has been initiated.
    console.log(responseData.from); // outputs "+14506667788"

});
*/
