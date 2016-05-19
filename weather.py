from cachetools import TTLCache
import time
import urllib2
import json

class Location(object):
    def __init__(self):
        self.cache = TTLCache(maxsize=100,ttl=600)
    def set_ip(self,ip,lat,lon):
        if ip not in self.cache:
            self.cache[ip] = {}
            self.cache[ip]['time'] = time.clock()
            self.cache[ip]['weather'] = self.get_weather_by_ll(lat,lon)
            self.cache[ip]['colortemp'] = self.get_rgb(self.cache[ip]['weather']['temp'])
        
        self.cleanup(ip)

    def get_city(self,city):
        return self.cache[city]
    def get_cities(self):
        
        return self.cache
    def cleanup(self,ip):
        locs = {}
        # remove unknown weather
        if self.cache[ip]['weather']['temp'] == 'Unknown':
            del self.cache[ip]
        # remove duplicate city,state
        for loc in self.cache:
            loc_key = self.cache[loc]['weather']['city']+self.cache[loc]['weather']['state']
            if loc_key in locs:
                print 'DELETING KEY',loc
                del self.cache[loc]
            else:
                locs[loc_key] = loc_key
    def get_rgb(self,temp):
        r = 0
        g = 0
        b = 0
        maxtemp = 90
        mintemp = 30
        right_r = 242
        left_r = 36
        right_g = 95
        left_g = 123
        right_b = 92
        left_b = 160
        temp = float(temp)
        if temp >= maxtemp:
            print('TEMP GREATER 100')
            r = right_r
            g = right_g
            b = right_b
        elif temp <= mintemp:
            print('TEMP LESS 0')
            r = left_r
            g = left_g
            b = left_b
        else:

            x = float(temp-mintemp) / float(maxtemp-mintemp)
            r = int(((right_r - left_r) * x ) + left_r)
            g = int(((left_g - right_g) * (1 - x)) + right_g)
            b = int(((left_b - right_b) * (1 - x)) + right_b)
            print('TEMP JUST RIGHT',x,r,g,b)
        ret = 'rgb('+str(r)+','+str(g)+','+str(b)+')'
        print 'TEMP',temp,'RGB',ret
        return ret
    def get_weather_by_ll(self,lat,lon):
        print 'TRYING TO GET WEATHER BY LAT LON',lat,lon
        try:
            f = urllib2.urlopen('http://api.wunderground.com/api/b6181dab037fba07/geolookup/conditions/q/'+str(lat)+','+str(lon)+'.json')
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
            
            print "LLCurrent temperature in %s is: %s" % (location, temp_f)
            print "LLCurrent conditions: %s with winds: %s" % (string_w, wind)
            print "LLLocal Time: %s" % o_time
            f.close()
            return {'conditions':string_w,'temp':temp_f,'wind':wind,'wind_dir':wind_dir,'time':o_time,'city':city,'state':state,'country':country}
        except:
            return {'temp':'Unknown'}
    def get_weather(self,city,state):
        city = city.replace(' ','_')
        try:
            f = urllib2.urlopen('http://api.wunderground.com/api/b6181dab037fba07/geolookup/conditions/q/'+state+'/'+city+'.json')
            json_string = f.read()
            parsed_json = json.loads(json_string)
            location = parsed_json['location']['city']
            temp_f = parsed_json['current_observation']['temp_f']
            string_w = parsed_json['current_observation']['weather']
            wind = parsed_json['current_observation']['wind_mph']
            wind_dir = parsed_json['current_observation']['wind_dir']
            o_time = parsed_json['current_observation']['observation_time']
            print "Current temperature in %s is: %s" % (location, temp_f)
            print "Current conditions: %s with winds: %s" % (string_w, wind)
            print "Local Time: %s" % o_time
            f.close()
            return {'conditions':string_w,'temp':temp_f,'wind':wind,'wind_dir':wind_dir,'time':o_time}
        except:
            return {'conditions':'Unknown','temp':'Unknown','wind':'Unknown','wind_dir':'Unknown','time':'Unknown'}

location = Location()