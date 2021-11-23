# Weather-WebApp as part of Internet Applications Module 

A Web application that that displays 5 day weather and gives a summary of the destination entered. The web app works on a client server mode. 

# Server Side
The server side is a simple node.js server which handles incoming requests from the client. Upon receiving the city name it call the open weather
API to get the 5-day weather forecast. It computes the 5 daily average temperature, rainfall & windspeed. The server uses the city information from 
the API data to call the air quality API to get the 5-day PM_25 forecast. It the computes the 5-day average PM_25 levels and sends the information 
along with the other to the client side.


# Client Side
A simple client using vue.js in HTML which lets the user enter the city name and sends it to the client. Upon recieving the data from the client it then displays 
the weather day.
