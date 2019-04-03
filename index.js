// Load environment variables
require('dotenv').config();

var PORT = process.env.PORT;
var SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/slack/slash-commands/send-me-buttons', (req, res) => {
  // res.status(200).end() // best practice to respond with empty 200 status code
  console.log(req.body);
  var reqBody = req.body
  var responseURL = reqBody.response_url
  if (reqBody.token !== SLACK_VERIFICATION_TOKEN) {
    res.status(403).end("Access forbidden")
  } else {
    console.log("Access granted")
    return res.json([
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Hello, your colleague seems not to be responding now. Click the button below to explore more options to reach them."
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Explore",
              "emoji": true
            },
            "url": "https://docs.google.com/document/d/1Lr6Zn65WOx7ju2pvjkKSMrhCjeERzAGHDSIjrOO1nj4/edit"
          }
        ]
      }
    ]);
    // sendMessageToSlackResponseURL(responseURL, message)
  }
})

function sendMessageToSlackResponseURL(responseURL, JSONmessage) {
  console.log("send response to " + responseURL);
  var postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: JSONmessage
  }
  request(postOptions, (error, response, body) => {
    console.log("slack response: ");
    console.log(response);
    console.log("slack body: " + body);
    if (error) {
      // handle errors as you see fit
      console.log(error)
    }
  })
}

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))