// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT;
const SLACK_SECRET = process.env.SLACK_SIGNING_SECRET;

// time in milliseceonds before the bot suggest to post a message
const RESPONSE_TIME_MS = 5000;

const express = require('express');
const request = require('request');
const app = express();

// var bodyParser = require('body-parser');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

// Initialize using signing secret from environment variables
const {createEventAdapter} = require('@slack/events-api');
const {createMessageAdapter} = require('@slack/interactive-messages');


const slackEvents = createEventAdapter(SLACK_SECRET);
// Create the adapter using the app's signing secret, read from environment variable
const slackInteractions = createMessageAdapter(SLACK_SECRET);

// Mount the event handler on a route
app.use('/slack/events', slackEvents.expressMiddleware());

// Attach the adapter to the Express application as a middleware
app.use('/slack/actions', slackInteractions.expressMiddleware());

// keep track of timers, so that we can cancel them when someone reply to a message
const mapTimers = {};

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  console.log(event);
  // if it comes from a user (not a Bot) and not a thread (reply to message)
  if (event.user !== undefined && event.thread_ts === undefined) {
    mapTimers[event.user + '_' + event.channel] =
      setTimeout(sendMessage.bind(null, event.text, event.channel, event.user), RESPONSE_TIME_MS);
  } else if (event.thread_ts !== undefined) {
    const timerIndex = event.parent_user_id + '_' + event.channel;
    if (mapTimers.hasOwnProperty(timerIndex)) {
      clearTimeout(mapTimers[timerIndex]);
      delete mapTimers[mapTimers];
    }
  }
});


// Run handlerFunction for any interactions from messages with a callback_id of welcome_button
slackInteractions.action('show-coffee-corner', (payload, respond) => {
  console.log('show coffee corner');

  // TODO: post the message on the board at the coffee corner

  const message = {
    text: 'Job done!',
  };
  respond(message);
});


// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);


function sendMessage(message, channel, user) {
  console.log("send response to " + user);
  const postOptions = {
    uri: "https://slack.com/api/chat.postMessage",
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
      'Authorization': 'Bearer ' + process.env.BOT_TOKEN
    },
    json: {
      "text": `Hey <@${user}>, looks like you did not get a reply to your message, shall I post it on the board at the coffee corner?`,
      "channel": channel,
      "attachments": [
        {
          "text": message,
          "callback_id": "show-coffee-corner",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "show-bt",
              "text": "Show @ the Coffee Corner",
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