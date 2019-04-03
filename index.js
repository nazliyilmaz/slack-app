// Load environment variables
require('dotenv').config();

var PORT = process.env.PORT;
var SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;

var express = require('express');
var request = require('request');
// var bodyParser = require('body-parser');
var app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

// Initialize using signing secret from environment variables
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');


const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
// Create the adapter using the app's signing secret, read from environment variable
const slackInteractions = createMessageAdapter(process.env.SLACK_SIGNING_SECRET);

const port = process.env.PORT || 3000;

// Mount the event handler on a route
app.use('/slack/events', slackEvents.expressMiddleware());

// Attach the adapter to the Express application as a middleware
app.use('/slack/actions', slackInteractions.expressMiddleware());

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event)=> {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  console.log(event);
  if (event.user !== undefined) {
    sendMessage("Did you say '" +event.text + "'?", event.user, event.channel);
  }
});


// Run handlerFunction for any interactions from messages with a callback_id of welcome_button
slackInteractions.action('show-coffee-corner', (payload, respond) => {
  console.log('show coffee corner');
  const message = {
    text: 'Job done!',
  };
  respond(message);
});


// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);




app.post('/slack/slash-commands/send-me-buttons', (req, res) => {
  // res.status(200).end() // best practice to respond with empty 200 status code
  console.log(req.body);
  var reqBody = req.body
  var responseURL = reqBody.response_url
  if (reqBody.token !== SLACK_VERIFICATION_TOKEN) {
    res.status(403).end("Access forbidden")
  } else {
    console.log("Access granted")
    return res.json(

    );
    // sendMessageToSlackResponseURL(responseURL, message)
  }
})


function sendMessage(message, user, channel) {
  console.log("send response to " + user);
  var postOptions = {
    uri: "https://slack.com/api/chat.postMessage",
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
      'Authorization': 'Bearer ' + process.env.BOT_TOKEN
    },
    json: {
      "text": `Hey <@${user}>, would you like to show this message on the board at the coffee corner?`,
      "channel": channel,
      "attachments": [
        {
          "fallback": "You are unable to choose a game",
          "callback_id": "show-coffee-corner",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "show-bt",
              "text": "Yes",
              "type": "button",
              "value": "yes"
            }
          ]
        }
      ]
    }
  };
  request(postOptions, (error, response, body) => {
    console.log("slack body: " + body);
    console.log(body);
    if (error) {
      // handle errors as you see fit
      console.log(error)
    }
  })
}

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));


//   {
//     "type": "actions",
//     "elements": [
//     {
//       "type": "button",
//       "text": {
//         "type": "plain_text",
//         "text": "Explore",
//         "emoji": true
//       },
//       "url": "https://docs.google.com/document/d/1Lr6Zn65WOx7ju2pvjkKSMrhCjeERzAGHDSIjrOO1nj4/edit"
//     }
//   ]
//   }
// }