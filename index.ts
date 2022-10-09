// Import all dependencies, mostly using destructuring for better view.
import { ClientConfig, Client, middleware, MiddlewareConfig, WebhookEvent, TextMessage, MessageAPIResponseBase } from '@line/bot-sdk';
import express, { Application, Request, response, Response } from 'express';

//Weather dependencies app
import bodyParser from "body-parser";
import { DotenvConfigOptions } from 'dotenv';
import { request } from 'http';
import fetch from 'node-fetch';

const apiKey = `${process.env.API_KEY}`;
var longitude = `${process.env.Longitude}`;
var latitude = `${process.env.Latitude}`;


// Setup all LINE client and Express configurations.
const clientConfig: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET,
};

const middlewareConfig: MiddlewareConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET || '',
};

const PORT = process.env.PORT || 3000;

// Create a new LINE SDK client.
const client = new Client(clientConfig);

// Create a new Express application.
const app: Application = express();


// Function handler to receive the text.
const textEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
  // Process all variables here.
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  // Process all message related variables here.
  const { replyToken } = event;
  const { text } = event.message;
  const cheerio= require("cheerio");

  async function quoteRequestMotivate(){
    fetch('https://quotes.toscrape.com/random')
    .then((response) => response.text())
    .then((body) => {
      const $ = cheerio.load(body);
      reply($('.text').text());
    }); 

  };

  var latitude:number= 26.640628;
  var longitude:number = -81.8723084;
  
 
  var i:number = 0;
  async function weatherRequestStandard(){
   //reply('Working on it-Matt');
   
   fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,daily&units=imperial&appid=${apiKey}`)
   .then((response) => response.json())
   .then((data) => {
    var hourly = (data.hourly);
    
    for (let i in hourly){
      //console.log(i + ": "+ (JSON.stringify(data.hourly[i].dt)))
     //console.log("every single one is: "+data.hourly[i]);
     
      var time = ((data.hourly[i].dt))
      
      var date = new Date(time*1000);

      const dateObject = new Date(date)
      
      const humanDateFormat = dateObject.toLocaleString('en-US', {timeZone: 'America/New_York'}) //2019-12-9 10:30:15
      
      const hour =  dateObject.toLocaleString("en-US", {timeZone: 'America/New_York',hour: "numeric"});
        if (hour == '9 PM'){
          break;
        }else if(hour.match(/^(3 PM|4 PM|5 PM|6 PM|7 PM|8 PM)$/)){
            console.log("Weather: "+ JSON.stringify(data.hourly[i].weather[0]['id']));
              //Check thunderstorms first, also any bad weather
              if(data.hourly[i].weather[0]['id'].match(/^800|801|802|803|804)$/)){
                reply("this hour is good to run:"+ hour);
              }
              
              //check temps and wind and everything else second

        }

 
      //console.log(humanDateFormat);

    }

   }); 
   
   };

async function reply(sendThis:any){
  const response: TextMessage = {
    type: 'text',
    text: sendThis,
  };
  await client.replyMessage(replyToken, response);
};
  
  
  switch (text.trim()) {
    case 'Weather':
      weatherRequestStandard();
      break;
    case 'Matt':
      reply('Matt is my creator. My everything. He is my rock.');
      break;
    case 'Motivate':
      quoteRequestMotivate();
      break;
    default:
      reply(text);

  }
  
};

// Register the LINE middleware.
// As an alternative, you could also pass the middleware in the route handler, which is what is used here.
// app.use(middleware(middlewareConfig));

// Route handler to receive webhook events.
// This route is used to receive connection tests.
app.get(
  '/',
  async (_: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      status: 'success',
      message: 'Connected successfully!',
    });
  }
);

// This route is used for the Webhook.
app.post(
  '/webhook',
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<Response> => {
    const events: WebhookEvent[] = req.body.events;

    // Process all of the received events asynchronously.
    const results = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        try {
          await textEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }

          // Return an error message.
          return res.status(500).json({
            status: 'error',
          });
        }
      })
    );

    // Return a successfull message.
    return res.status(200).json({
      status: 'success',
      results,
    });
  }
);

// Create a server and listen to it.
app.listen(PORT, () => {
  console.log(`Application is live and listening on port ${PORT}`);
});
