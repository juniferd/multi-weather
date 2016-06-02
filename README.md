# multi-weather
this is a weather app that will display the weather based on all clients' IP addresses

## get started
- pip install requirements
    ```
    pip install -r requirements.txt
    ```
- download [geolite2 city database](http://dev.maxmind.com/geoip/geoip2/geolite2/)

- make a directory called "db" at top level

- move mmdb into this directory

- sign up for a [wunderground api key](https://www.wunderground.com/weather/api/)

- create a config.py file and paste your wunderground api key in there
    ```
    WU_API_KEY = <your api key here>
    ```

- run the app
    ```
    python app.py
    ```

## see it in action
[multi weather](http://favonius.blastic.us/)