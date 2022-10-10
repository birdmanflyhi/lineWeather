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
            //console.log("Weather: "+ JSON.stringify(data.hourly[i].weather[0]['id']));
            var weatherID = JSON.stringify(data.hourly[i].weather[0]['id']);
              //Check thunderstorms first, also any bad weather
            function weatherReply(){

              console.log("Temp: "+ JSON.stringify(data.hourly[i].temp)+ " |humidity: "+ 
              JSON.stringify(data.hourly[i].humidity)+ " |wind speed: "+ JSON.stringify(data.hourly[i].wind_speed)+ "|");
          
            }
              switch (weatherID) { 
                case '210':
                  console.log('Just a light thunderstorm, should be ok: '+ hour);
                  weatherReply();
                  break;
                case '200':
                case '201':
                case '202':
                case '211':
                case '212':
                case '221':
                case '230':
                case '231':
                case '232':
                  console.log('Thunderstorms medium or heavy, do not run: '+ hour);
                  break;
                case '300':
                case '301':
                case '310':
                  console.log('Just some light drizzle, have a good run: '+ hour);
                  weatherReply();
                  break;
                case '302':
                case '311':
                case '312':
                case '313':
                case '314':
                case '321':
                  console.log('It`s a heavy drizzle/shower, recommend no run: '+ hour);
                  break;
                case '500':
                case '520':
                  console.log('Just some light rain/shower, hopefully you gucci: '+ hour);
                  weatherReply();
                  break;
                case '501':
                case '502':
                case '503':
                case '504':
                case '511':
                case '521':
                case '522':
                case '531':
                  console.log('Not good because of rain/storm: '+ hour);
                  break;
                case '600':
                  console.log('Should be ok, just light snow/rain: '+ hour);
                  weatherReply();
                  break;
                case '601':
                case '602':
                case '611':
                case '612':
                case '613':
                case '615':
                case '616':
                case '620':
                case '620':
                case '620':
                  console.log('Do not run snow/sleet: '+ hour);
                  break;
                case '741':
                  console.log("It is foggy out there: "+ hour);
                  weatherReply();
                  break;
                case '701':
                  console.log('Just mist(ligther than fog), run will be good: '+ hour);
                  weatherReply();
                  break;
                case '711':
                case '721':
                case '731':
                case '751':
                case '761':
                case '762':
                case '771':
                case '781':
                  console.log('Do not run extreme atmosphere conditions such as tornado or smoke: '+ hour);
                  break;
                case '800':
                  console.log("Clear sky, good to run: "+ hour);
                  weatherReply();
                  break;
                case '801':
                case '802':
                case '803':  
                case '804':
                  console.log('Just some clouds, send it bro: '+ hour);
                  weatherReply();
                  break;
                default:
                  console.log('No weather id matched: '+ hour);
                  weatherReply();


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
