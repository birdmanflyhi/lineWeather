// Import all dependencies, mostly using destructuring for better view.
import { ClientConfig, Client, middleware, MiddlewareConfig, WebhookEvent, TextMessage, MessageAPIResponseBase } from '@line/bot-sdk';
import express, { Application, Request, response, Response } from 'express';
import { motivateQuotes } from './quotes';

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
  const { text, emojis } = event.message;
  

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
  var lat:number;
  var long:number;
  var zip:number;
  var dayTime:string;
  
  async function weatherRequestStandard(zip:number,dayTime:string){

    if(zip == 33907){
      lat = latitude;
      long = longitude;

      weatherRequestExtended(lat, long, dayTime);
    } else{
     
      fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${zip}&appid=${apiKey}`)
      .then((response) => response.json())
      .then((data) => {
      
      lat = data.lat;
      long = data.lon;
      weatherRequestExtended(lat, long, dayTime);
     })
      
     };

  };
    
  async function weatherRequestExtended(lat:number, long:number, dayTime:string){
   
   fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&exclude=minutely,daily&units=imperial&appid=${apiKey}`)
   .then((response) => response.json())
   .then((data) => {
    var hourly = (data.hourly);

    var response: string[] = [];
    for (let i in hourly){
      //console.log(i + ": "+ (JSON.stringify(data.hourly[i].dt)))
     
      var time = ((data.hourly[i].dt))
      var date = new Date(time*1000);
      const dateObject = new Date(date)
      
      const humanDateFormat = dateObject.toLocaleString('en-US', {timeZone: 'America/New_York'}) //2019-12-9 10:30:15
      
      var comment = '';
      
      const hour =  dateObject.toLocaleString("en-US", {timeZone: 'America/New_York',hour: "numeric"});
       console.log(dayTime);


        if (hour == '9 PM'){
          break;
        }else if(hour.match(/^(3 PM|4 PM|5 PM|6 PM|7 PM|8 PM)$/)){
            var weatherID = JSON.stringify(data.hourly[i].weather[0]['id']);
              //Check thunderstorms first, also any bad weather
            weatherType(weatherID);
        }

            function weatherType(weatherID:string){
              switch (weatherID) { 
                case '210':
                  weatherReply(hour + ' 🌩️' + ' Just a light thunderstorm, should be ok: ');
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
                  weatherReply(hour + ' 🌩️' + ' Thunderstorms medium or heavy, do not run: ');
                  break;
                case '300':
                case '301':
                case '310':
                  weatherReply(hour + ' 🌧️' + ' Just some light drizzle, have a good run: ');
                  break;
                case '302':
                case '311':
                case '312':
                case '313':
                case '314':
                case '321':
                  weatherReply(hour + ' 🌧️' + ' It`s a heavy drizzle/shower, recommend no run: ');
                  break;
                case '500':
                case '520':
                  weatherReply(hour + ' 🌧️' + ' Just some light rain/shower, hopefully you gucci: ');
                  break;
                case '501':
                case '502':
                case '503':
                case '504':
                case '511':
                case '521':
                case '522':
                case '531':
                  weatherReply(hour +' ⛈️' + ' Not good because of rain/storm: ');
                  break;
                case '600':
                  weatherReply(hour + ' 🌨️' + ' Should be ok, just light snow/rain: ');
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
                  weatherReply(hour + ' ❄️' + ' Do not run snow/sleet: ');
                  break;
                case '741':
                  weatherReply(hour + ' 🌫️' + " It is foggy out there: ");
                  break;
                case '701':
                  weatherReply(hour + ' 🌫️' + ' Just mist(ligther than fog), run will be good: ');
                  break;
                case '711':
                case '721':
                case '731':
                case '751':
                case '761':
                case '762':
                case '771':
                case '781':
                  weatherReply(hour + ' 💨 🌪️' + ' Do not run extreme atmosphere conditions such as tornado or smoke: ');
                  break;
                case '800':
                  weatherReply(hour + ' ☀️' + " Clear sky, good to run: ");
                  break;
                case '801':
                case '802':
                case '803':  
                case '804':
                  weatherReply( hour +' ☁️' + ' Just some clouds, send it bro:');
                  break;
                default:
                  weatherReply(hour +' 🙊' + ' Oopsie. No weather id matched: ');
           
              }    
            } 
            function weatherReply(comment:string){
              response.push(comment +  
               " Temp:"+ JSON.stringify(data.hourly[i].temp)+ " | humidity:"+ 
               JSON.stringify(data.hourly[i].humidity)+ " | wind speed:"+
               JSON.stringify(data.hourly[i].wind_speed)+ " |" + `\n`);
             }
        
    }
    reply(response.join("\n"));
    
    }); 
   
};

async function reply(sendThis:any){
  const response: TextMessage = {
    type: 'text',
    text:  sendThis,
    
  };
  await client.replyMessage(replyToken, response);
};

//var numberText:number = parseInt(text);
text.trim().toLowerCase();


var checkText = text.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase().trim();

if(( isNaN(parseInt(checkText)) == false  && checkText.length == 5))
{
  var zip:number = parseInt(checkText);
  weatherRequestStandard(zip, 'pm');
  
}else{

       switch (checkText) {
         case 'tell me what the weather is':
         case 'get me the weather':
         case 'what is the weather':
         case 'what is the weather for today':
         case 'get me the weather please':
         case 'please get me the weather':
         case 'weather':
           weatherRequestStandard(33907, 'pm');
           break;
         case 'weather new location':
         case 'new zip code':
         case 'im not at home':
         case 'im not at that location':
         case 'thats not my address':
         case 'different location':
         case 'new location':
           reply('Please give me the zip code');
           break;
         case 'weather am':
           weatherRequestStandard(33907, 'am');
           break;
         case 'who is your creator':
         case 'who is your creator?':
         case 'who created you?':
         case 'who created you':
         case 'matt':
         case 'who is matt':
          reply('Matt is my creator. My everything. He is my rock.');
           break;
         case 'motivate me':
         case 'can you motivate me':
         case 'motivate':
           //quoteRequestMotivate();
           var randomIndex = Math.floor(Math.random() * motivateQuotes.length);
           var quote = motivateQuotes[randomIndex];
           reply(quote);
           break;
         case 'emoji':
           reply( 'Working on this '+'☁️');
           break;
         case '':
           reply('trying simpler');
         default:
           reply(text);
        }
      
    };
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
