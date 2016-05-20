from cachetools import TTLCache
import uuid
import time
import urllib2
import json
import logging

class Location(object):
    def __init__(self):
        self.cache = TTLCache(maxsize=100,ttl=600)
    def set_ip(self,ip,lat,lon):
        if ip not in self.cache:
            self.cache[ip] = {}
            self.cache[ip]['id'] = str(uuid.uuid1())
            self.cache[ip]['time'] = time.clock()
            self.cache[ip]['weather'] = self.get_weather_by_lat_lon(lat,lon)
            self.cache[ip]['colortemp'] = self.get_rgb(self.cache[ip]['weather']['temp'])
        
        self.cleanup(ip)

    def get_city(self,city):
        return self.cache[city]


    def get_cities(self):
        return self.cache

    # deletes item from TTLCache if the weather conditions are unknown or if duplicate city/state
    def cleanup(self,ip):
        locs = {}
        # remove unknown weather
        if self.cache[ip]['weather']['temp'] == 'Unknown':
            logging.debug('DELETING UNKNOWN CONDITIONS %s' % ip)
            del self.cache[ip]
        # remove duplicate city,state
        for loc in self.cache:
            loc_key = self.cache[loc]['weather']['city']+self.cache[loc]['weather']['state']
            if loc_key in locs:
                logging.debug('DELETING DUP KEY %s' % loc)
                del self.cache[loc]
            else:
                locs[loc_key] = loc_key

    # this will return an rgb value to match temperature (blue for cold, red for hot)
    def get_rgb(self,temp):
        r = 0
        g = 0
        b = 0
        maxtemp, mintemp = (90,30)
        right_r, right_g, right_b = (242,95,92)
        left_r, left_g, left_b = (36,123,160)
        temp = float(temp)

        if temp >= maxtemp:
            r = right_r
            g = right_g
            b = right_b
        elif temp <= mintemp:
            r = left_r
            g = left_g
            b = left_b
        else:
            x = float(temp-mintemp) / float(maxtemp-mintemp)
            r = int(((right_r - left_r) * x ) + left_r)
            g = int(((left_g - right_g) * (1 - x)) + right_g)
            b = int(((left_b - right_b) * (1 - x)) + right_b)

        ret = 'rgb(%s,%s,%s)' % (str(r),str(g),str(b))
        
        logging.debug('TEMP: %s RGB: %s' % (temp,ret))
        return ret

    # sets wunderground api key
    def set_api_key(self,api_key):
        self.api_key = api_key
        return self.api_key

    # attempts to get weather conditions using wunderground api
    def get_weather_by_lat_lon(self,lat,lon):
        URL = 'http://api.wunderground.com/api/%s/geolookup/conditions/q/%s,%s.json' % (self.api_key,str(lat),str(lon))
        logging.debug('TRYING TO GET WEATHER BY LAT LON: %s, %s' % (lat,lon))
        try:
            f = urllib2.urlopen(URL)
            json_string = f.read()
            parsed_json = json.loads(json_string)
            city = str(parsed_json['location']['city'])
            state = str(parsed_json['location']['state'])
            country = str(parsed_json['location']['country_name'])
            temp_f = parsed_json['current_observation']['temp_f']
            string_w = str(parsed_json['current_observation']['weather'])
            wind = parsed_json['current_observation']['wind_mph']
            wind_dir = str(parsed_json['current_observation']['wind_dir'])
            o_time = str(parsed_json['current_observation']['observation_time'])
            
            logging.debug("Current temperature in %s is: %s" % (location, temp_f)) 
            logging.debug("Current conditions: %s with winds: %s" % (string_w, wind))
            logging.debug("Local Time: %s" % o_time)
            f.close()
            return {'conditions':string_w,'temp':temp_f,'wind':wind,'wind_dir':wind_dir,'time':o_time,'city':city,'state':state,'country':country}
        except:
            return {'temp':'Unknown'}

location = Location()