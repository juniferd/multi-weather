from flask import Flask, render_template,request,jsonify,Response
from werkzeug.contrib.fixers import ProxyFix
from random import randint
import geoip2.database
import weather
import logging
import json

app = Flask(__name__)
app.config.from_object('config')
app.wsgi_app = ProxyFix(app.wsgi_app)
weather.location.set_api_key(app.config['WU_API_KEY'])
logging.basicConfig(level=logging.DEBUG)

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/api/get_weather", methods=['GET'])
def set_client_ip():
    reader = geoip2.database.Reader('db/GeoLite2-City.mmdb')
    client_ip = request.environ['REMOTE_ADDR']
    logging.debug('GET LOCATION FOR %s' % client_ip)
    try:
        
        response = reader.city(client_ip)
        status=200
    except:
        randLoc = [
            '128.101.101.101',
            '186.105.181.7',
            '209.77.92.130',
            '21.237.147.233',
            '3.10.230.84',
            '82.237.252.146',
            '21.136.74.71',
            '139.94.33.141',
            '126.14.31.58',
            '119.211.64.73',
            '34.156.202.55'
        ]
        rnum = randint(0,10)
        response = reader.city(randLoc[rnum])
        status = 202
        
    latitude = float("{0:.1f}".format(response.location.latitude))
    longitude = float("{0:.1f}".format(response.location.longitude))
    
    weather.location.set_ip(response.traits.ip_address,latitude,longitude)
    
    #logging.info('GET CITIES %s' % weather.location.get_cities())

    res = Response(response=json.dumps(weather.location.get_cities()),status=status)

    return res

@app.route("/api/get_weather_in_city", methods=['GET'])
def fetch_weather():
    query = str(request.args.get('query'))
    logging.debug('FETCHING WEATHER FOR CITY %s' % query)
    try:
        city,state = query.split(',')
        city = city.rstrip()
        state = state.lstrip()
        ret = weather.location.set_loc(city,state)
    except:
        ret = 'unrecognized'
    ret = jsonify({'ret':ret})

    return ret
@app.errorhandler(404)
def page_not_found(e):
    logging.debug(request.headers)
    return render_template('404.html')

if __name__ == "__main__":
    app.run(
        port=5001
    )