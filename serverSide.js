/*
Internet Applications - Assignment 1
Rahul Seth
17302557
Weather Web Application using express and vue.js

Server Side

Code Structure
-> app.get = starts server
-> app.get = waits for client request
    -> receives url client
    -> cleans url and store in the city name
    -> passes city name as parameter in api url
    -> makes request to api for data, api returns data
        -> data passed onto function processData.
            -> prcessData converts data into json
            -> calls display5day weather with json data as parameter
             -> gets the latitude and longitude for pollution api
             -> cleans up and stores dates to map temp. acc to date. 
             -> compares dates in order to get average daily temp which is the requirement
             -> if dates are same, temp for each date is added. If not, temps are mapped according that dates in a seperate array
             -> same is done for wind data. For rainfall i get data using weather description and again is stored in a seperate array acc to dates.
             -> differnet functions like checktemp, check rain are called to compute the reccomodation as per the given criterion to us
             -> data is then returned to here
             -> Pollution API is called here 
                -> get pm25_data function is called here which computes pm25 levels avrg per day levels based on dates
                -> gets 5 day avg pm25 levels
                -> calls for mask_recc function
                -> returns result based on ppm25 levels
            ->Data is return here
            -> Data added to orginal data table
            -> data sent client
*/

//Importing libraries required
"use strict";
const express = require('express');
const app = express();
const cors = require("cors")
const path = require('path')
const request = require('request');
const port = 3000;

app.use(cors())

// Global Variables
let data_table = "";
var datatoBesent;
let lat = "";
let lon = "";

// function for getting city name from incoming url
function cleanUrl(url, size){
    let result = "";  
    for(let i=8;i<size;i++){
        result = result.concat(url[i])
    }
    return result; 
}

// Weather functions
// function to convert unix timestamp to date
// for air pollution data since timestamp is inunix
function convertTime(timestamp){
    const ms = timestamp*1000
    const dateobj = new Date(ms)
    const date = dateobj.toLocaleString()
    return date
}


//function to compute avg 5 day temp
function avgTemp(data){
    let sum = 0;
    let avg = 0;

    for(let i =0; i<data.length; i++){
        sum = sum + data[i];
    }
    avg = sum/data.length;
    return avg;
}

// function to check rain in json data
function checkforRain(json_obj){
    let msg = "";    
    for(let i=0; i<json_obj.length; i++){
        if(json_obj[i] == "Rain"){
            msg = "-->   Rainy Weather. Pack an umbrella.\n";
        }
    }
    return msg;
}

// function to check for temp
function checkforTemp(temp){
    let msg = "";

    if(temp < 10 && temp > -10){
        msg = "->>   Pack for Cold Weather. \n";
    }

    if(temp <20 && temp>10){
        msg = "->>   Pack for Warm Weather.\n";
    }

    if(temp > 20){
        msg = "->>   Pack for Hot Weather.\n";
    }
    return msg;
}


// Functions for pollution data //

//Getting reccomondation for mask
function mask_recc(pm_values){
    let sum =0;
    let avg=0;
    let msg = "";

    for(let i=0; i<5; i++){
        sum = sum + pm_values[i]
    }

    avg = sum/5
    if(avg > 10){
        msg = "->>       PM 2.5 Levels High. Carry a mask."
    }
    else{
        msg = "->>       Pollution Levels OK."
    }
    return msg;
}

// Seperating pm_25 data according to dates
//Similar logic used for this as was done for temp 
function getpm_25Data(json_obj){

    let pm25_now = 0;
    let pm25_bef = 0;
    let index = -1;
    
    let dates = [0,0,0,0,0];
    let pm_25_vals = [0,0,0,0,0];
    let avg_pm25_vals = [0,0,0,0,0];
    let counter = [0,0,0,0,0];
    let result = "";
    

    for(let i=0; i<json_obj.list.length; i++){

        pm25_now = convertTime(json_obj.list[i].dt).substr(0,10)
        
        if(pm25_now != pm25_bef){
            index = index + 1;
            dates[index] = convertTime(json_obj.list[i].dt).substr(0,10)
        }

        if(pm25_bef == pm25_now || pm25_bef == 0){
            pm_25_vals[index] = pm_25_vals[index] + json_obj.list[i].components.pm2_5;
            counter[index] = counter[index] + 1;
        }
        pm25_bef = pm25_now;
    }

    for(let i=0; i<5; i++){
        avg_pm25_vals[i] = pm_25_vals[i]/counter[i];
    }
    result = mask_recc(avg_pm25_vals);

    return result;
}

// Display function
//function to get 5 day weather//
function display5dayweatherData(json_obj){

    //for storing each date
    let dates = [];
    //For storing temp data
    let temp_data = [0,0,0,0,0];
    let daily_avg_temp = [0,0,0,0,0];
    //for rain data
    let rain_level = [];
    let rain_data = ["", "", "", "", ""];
    //for wind data
    let wind_data = [0,0,0,0,0];
    let dailyAvg_windSpd = [0,0,0,0,0];
    //simple counter
    let counter = [0,0,0,0,0];

    // for comparing dates
    let index = -1;
    let date_now = 0;
    let date_bef = 0;

    // Getting city details
    let country = "";
    let city = "";
    country = json_obj.city.country;
    city = json_obj.city.name;

    //getting coordinates for pollution api
    lat = json_obj.city.coord.lat;
    lon = json_obj.city.coord.lon;

    // Different states for rain, temp
    let rain_status = "";  
    let avg_dtemp = 0;
    let temp_status = "";

    // table with data to be sent to client
    data_table = "Weather Reccomondations: \n";
    data_table = `Showing results for ${city}, ${country} \n\n`;

    for(let i=0; i<json_obj.list.length; i++){
        date_now = (json_obj.list[i].dt_txt).substr(8,2);
        
        if(date_now != date_bef){
            index = index + 1;
            dates[index] = (json_obj.list[i].dt_txt).substr(0,10);
            rain_data[index] = (json_obj.list[i].weather[0].main)
        }

        if(date_bef == 0 || date_now == date_bef){
            wind_data[index] = json_obj.list[i].wind.speed;
            temp_data[index] = temp_data[index] + json_obj.list[i].main.temp;
            counter[index] = counter[index] + 1;
        }
        date_bef = date_now;
    }

    //getting daily average temps
    for(let i = 0; i<5; i++){
        daily_avg_temp[i] = temp_data[i]/counter[i];
        dailyAvg_windSpd[i] = wind_data[i]/counter[i];
    }

    //checking whether there is rain
    rain_status = checkforRain(rain_data)        
    data_table = data_table + rain_status;

    //getting aberage temp for 5 days
    avg_dtemp = avgTemp(daily_avg_temp);
    temp_status = checkforTemp(avg_dtemp);

    // Adding elements to datatable
    data_table = data_table + temp_status + "\n";  
    data_table = data_table + "\n" + "\t\tWeather Summary \n";  
    data_table = data_table + "Date        |   Temperature (C)  |    Wind (m/s)\n";
    
    for(let i=0; i<5; i++){
        data_table = data_table + dates[i] + "  |   " + daily_avg_temp[i].toFixed(2) + "            |         " + wind_data[i].toFixed(2) + "    \n";
    }
    return data_table;
}

//function to convert data from api to json and call on toher functions
function processData(data) {
    
    let forecast = "";

    let weather_data = JSON.parse(data)

    if(weather_data.city == undefined){
        console.log('City name Invalid.')
    }

    //getting 5 day data
    forecast = (display5dayweatherData(weather_data));
    return forecast;
}

//Server starts here
app.get("/", (req,res) => res.send("Server Started now."))

//Server looks for incoming connection
app.get('/mysite/:loc/', function(req, res) {

    let url = "";
    let urlPart = req.originalUrl;
    let nameSize = urlPart.length;
    let city_name = cleanUrl(urlPart,nameSize);
    console.log("City name Received: ");
    console.log(city_name);

    url = `http://api.openweathermap.org/data/2.5/forecast?q=${city_name}&units=metric&&appid=3d10d15c7a8bc53ce62bd2dc8b296a1e`;

    request(url, function(error, response,body){

        if(error){
            console.log('error: ', error);
        }
        else{
            console.log('Data retrieved successfully.')
        }
        
        datatoBesent; 
        datatoBesent= processData(body)
        datatoBesent = datatoBesent + "\n";

        var pData = "";
        let poll_output = "";
        let pollution_api = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=3d10d15c7a8bc53ce62bd2dc8b296a1e`;
    
        request(pollution_api,(error, response,body) => {
            if(error){
                console.log('error: ', error);
            }
            else{
                console.log('Pol. Data retrieved successfully.')
            }
            pData= JSON.parse(body)
            poll_output = getpm_25Data(pData)
            datatoBesent = datatoBesent + poll_output + "\n";
            console.log(datatoBesent);
            res.send(datatoBesent)
        });
    });
    
})


app.listen(port, function(){
    console.log(`Listening on port ${port}!`)
})

