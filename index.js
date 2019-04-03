// Load environment variables
require('dotenv').config();

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();
var urlencodedParser = bodyParser.urlencoded({extended: false});

var port = 8080;
var SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;

app.get('/slack/slash-commands/send-me-buttons', (req, res) => {
  res.status(200).end() // best practice to respond with empty 200 status code
  var reqBody = req.body
  var responseURL = reqBody.response_url
  if (reqBody.token !== SLACK_VERIFICATION_TOKEN) {
    res.status(403).end("Access forbidden")
  } else {
    var message = [
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
    ]
    sendMessageToSlackResponseURL(responseURL, message)
  }
})

function sendMessageToSlackResponseURL(responseURL, JSONmessage) {
  var postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: JSONmessage
  }
  request(postOptions, (error, response, body) => {
    if (error) {
      // handle errors as you see fit
      console.log(error)
    }
  })
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))