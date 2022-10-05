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


// Get city name passed in the form
//let city = text returned

// Use that city name to fetch data
// Use the API_KEY in the '.env' file
/*
function sendWeatherRequestStandard(){

  app.post('/', function(lat, long) {

      let latitude =lat;
      let longitude = long;

      let url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,daily&units=imperial&appid=${apiKey}`;


     request(url, function(err,response, body)){

      if (err){
        //text error
        const response: TextMessage = {
          type: 'text',
          text:  'Error Matt',
        };
      }
       
     };

};

let url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,daily&units=imperial&appid=${apiKey}`;
*/

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
  
  /*let hourly:{dt:number,temp:number,feels_like:number,pressure:number,humidity:number,
  dew_point:number,uvi:number,clouds:number,visibility:number,wind_speed:number,
  wind_deg:number,wind_gust:number,weather:[],pop:number};*/
 let hourly:string[];
 
  var i:number = 0;
  async function weatherRequestStandard(){
   //reply('Working on it-Matt');
   
   fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,daily&units=imperial&appid=${apiKey}`)
   .then((response) => response.json())
   .then((data) => {
     //console.log(JSON.stringify(data.hourly))
     //reply(typeof data.current)
    // hourly = 
  
   // console.log(data.dt);
     hourly = ((data.hourly))
     //console.log(hourly);
     
     hourly.forEach(getBest);

      function getBest(){

        //console.log('Hourly array: '+ i);
        //let unix_timestamp = hourly[0];
       // var obj=JSON.parse(hourly[i]);
          console.log(hourly[i]);
          i++;
      /*
        var date = new Date(unix_timestamp *1000);
        var hours = date.getHours();

        var minutes = "0" + date.getMinutes();

        var seconds = "0" + date.getSeconds();
        var formattedTime = hours + ":" + minutes.slice(-2) + ':' + seconds.slice(-2);
        console.log(formattedTime);
        */
       
      } 
     //reply(JSON.stringify(hourly));
     
     }); 
     //reply(data.hourly);
   

   
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
