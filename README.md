# Weather-WebApp 

A Web application developed using node.js that displays 5 day weather summary of the destination enetered. The web app works on a client-server model.

# Server Side
The server side is a simple node.js server which handles incoming requests from the client. Upon receiving the city name it calls the openweather
API to get the 5-day weather forecast. It computes the 5 daily average temperature, rainfall & windspeed. The server uses the city information from 
the API data to call the pollution forecast API to get the 5-day PM2_5 forecast. It then computes the 5-day average PM2_5 levels and sends the information 
along with the weather data to the client side.

# Client Side
A simple client using Vue.js in HTML which lets the user enter the destination and sends it to the server. Upon recieving the data from the server it then displays 
the weather and the pollution data.

