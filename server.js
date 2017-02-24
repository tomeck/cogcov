// For listening to webhook calls from Twilio
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

// For Twilio integration
var twilio = require('twilio');
// create a Twilio REST client
//var client = require('./twilio-node/lib')('ACbb28e740dadc52c2575f545b1d544b83', 'd31a27296b3b9ea2f0893cc64411198b');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// Setup Watson Conversation
var Conversation = require('watson-developer-cloud/conversation/v1');

// JTE TODO - get from VCAP_SERVICES?
var conversationUsername = 'e7628040-92ad-4a01-8415-467b78ee3110';
var conversationPassword = 'qGz4gBDXiHHi';
var conversationWorkspace = 'ba1d1b65-2ce5-4901-8377-2de214dea244';

// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  username: conversationUsername,
  password: conversationPassword,
  version_date: Conversation.VERSION_DATE_2017_02_03
  //url: 'https://gateway.watsonplatform.net/conversation/api'
});
// End Watson Conversation

var app = express();

// JTE NEEDED?
// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// parse application/json
//app.use(bodyParser.json());
//app.use(bodyParser.text());
app.use( bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.raw());

// Use this to get the entire body in raw format
//app.use(bodyParser.text({type: '*/*'}));

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

  console.log(req.headers['content-type']);

  // FORM-URLENCODED as per Twilio POST format
  var inFrom = req.body.From;
  var inBody = req.body.Body;
  console.log('Input received: ' + inBody + ' from ' + inFrom );


  //console.log('Workspace id is: ' + conversationWorkspace);

/*
  var payload = {
    workspace_id: conversationWorkspace,
    context: bcontext || {},
    input: binput || {}
  };
*/

  // JTE TODO - do I need to maintain/pass in conversation context?
  // Send the input to the conversation service
  conversation.message({
      input: { text: inBody },
      workspace_id: conversationWorkspace
    }, function(err, data) {
      var responseMsg;
      if (err) {
        console.error('Something bad happened: ' + JSON.stringify(err, null, 2));
        responseMsg = JSON.stringify(err, null, 2)
      } else {
        // Extract response
        var resptext = data.output.text[0];
        console.log(resptext);
        responseMsg = JSON.stringify({'response':resptext});
      }

      // Compose the response to Twilio that will be SMS'd back to originator
      var twiml = new twilio.TwimlResponse();
      twiml.message(responseMsg);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());

      console.log("Wrote message back to Twilio");
  });
});

/* --- ORIG WORKING

app.post('/sms', function(req, res) {

  try {
    console.log(req.headers['content-type']);

    // JSON
    //console.log( 'Received: ' + JSON.stringify(req.body, null, 2) );
    //var responseMsg = 'Thanks for sending ' + req.body['foo'];

    // TEXT
    //console.log( 'Received: ' + req.body );
    //var responseMsg = 'Thanks for sending ' + req.body;

    // FORM-URLENCODED
    var from = req.body.From;
    var body = req.body.Body;
    //var responseMsg = 'Received ' + body + ' from ' + from;
    //var responseMsg = 'Why would you send me such a stupid text like ' + body;
    var responseMsg = 'You suck';

    var twiml = new twilio.TwimlResponse();
    twiml.message(responseMsg);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());

    console.log("Wrote message back to Twilio");
  }
  catch(e) {
    console.log('ERROR: ' + e);
  }
});

*/

// JTE NEEDED?
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

/* ORIG
http.createServer(app).listen(1337, function () {
  console.log("Express server listening on port 1337");
});
*/

// start server on the specified port and binding host
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
