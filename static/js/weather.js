var SelectNode = function(){};

MicroEvent.mixin(SelectNode);

var selectNode = new SelectNode();

var WeatherItem = React.createClass({
  getInitialState: function(){
    return {
      selected: false,
      visible: 'invisible',
      bgcolor: ''
    }
  },
  _enterStyle: function () {
    this.setState({visible:'visible'})      
  },
  _leaveStyle: function () {
    this.setState({visible:'invisible'})
  },
  
  componentWillMount: function(){
    //console.log('mounting')
  },
  componentDidMount: function(){
    var self = this;
    setTimeout(() => {
      self._enterStyle();
    },50);
    //console.log('mounted')
    
  },
  componentWillUpdate: function(){
    //console.log('updating')
    
  },
  componentWillUnmount: function(){
    this._leaveStyle();
    
    console.log('unmounting', this)
  },
  
  getClasses: function() {
    var isSelected = this.state.selected
    var isVisible = this.state.visible
    var activeClass = 'inactive'
    if (isSelected){
      activeClass = 'active'
    }
    return (
      "weather-container "+activeClass+" "+isVisible
      )
  },
  setSelected: function(){

    selectNode.trigger('select',this.props.id);
    this.setState({selected: true})
    
  },
  getIcon: function(conditions){
    return CONDITIONS[conditions]
  },
  render: function(){
    var divStyle = {
      backgroundColor: this.props.color_temp
    }
    var icon = 'meteocon '+this.getIcon(this.props.conditions)
    return (            
      <div className = {this.getClasses()} 
        ref={this.props.id} 
        style={divStyle} 
        id={this.props.id}
        onClick = {this.setSelected}
        >
        <div>
          <div className = "temp">
            {this.props.temp}&deg;F
          </div>
          <div className = "conditions">
            <span className = {icon}/>
            <br/>
            {this.props.conditions}
          </div>
          <div className = "location">
            {this.props.loc}
          </div>
          <div className = "wind">
            {this.props.wind} mph {this.props.wind_dir}
          </div>
        </div>
      </div>

      );
  }
});
var WeatherBG = React.createClass({
  getInitialState: function(){
    return {
      wind: 0,
      icon: ''
    }
  },
  render: function(){
    var icon = 'meteocon '+this.state.icon
    return (
      <span className={icon}/>
    )
  }
});
var WeatherList = React.createClass({
  getInitialState: function() {
    var w = (Math.floor((window.innerWidth) / 220))*220
    return {
      data: [],
      loading: true,
      selected: '',
      winWidth: w
    };
  },
  handleResize: function(){
    var w = (Math.floor((window.innerWidth) / 220))*220
    this.setState({winWidth: w});
  },
  loadWeather: function(){
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({data:data});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });

  },
  prepWeatherData: function(data){
    var dataArr = []
    for (var key in data){
      var loc = {}
      loc['key'] = data[key]['id']
      loc['loc'] = data[key]['weather']['city']+', '
        +(data[key]['weather']['state'] ? data[key]['weather']['state'] : data[key]['weather']['country'])
      loc['temp'] = data[key]['weather']['temp']
      loc['conditions'] = data[key]['weather']['conditions']
      loc['time'] = data[key]['weather']['time']
      loc['wind'] = data[key]['weather']['wind']
      loc['wind_dir'] = data[key]['weather']['wind_dir']
      loc['colortemp'] = data[key]['colortemp']
      dataArr.push(loc)
    }
    return dataArr
  },
  componentWillMount: function(){
    this.loadWeather();
    this.setState({loading: false})
    var self = this
    selectNode.bind('select', function(refid){
      for (var key in self.refs){
        self.refs[key].setState({selected:false})
      }
      
      var wkey = 'weather-'+refid
      var wicon = self.refs[wkey].props['conditions']
      self.refs['bg'].setState({
        wind: self.refs[wkey].props['wind'],
        icon: CONDITIONS[wicon]
      })
    });
    
    setInterval(this.loadWeather, this.props.pollInterval);
  },
  componentDidMount: function(){
    this.handleResize
    window.addEventListener('resize', this.handleResize)
    
  },
  componentWillUpdate: function(){
    
  },
  componenetWillUnmount: function(){
    selectNode.unbind('select',function(){});
    window.removeEventListener('resize', this.handleResize)
  },
  handleClick: function(){
    console.log('HEY')
  },

  render: function(){
    //console.log('render',this)
    var dataArr=this.prepWeatherData(this.state.data);
    var index = 0
    var self = this;
    var divStyles = {
      width: this.state.winWidth
    }
    if (this.state.loading){
      return (
        <div className="loading">loading...</div>
        );
    } else {
      
      var weatherNodes = dataArr.map(function(weather) {
      return (
        <WeatherItem 
        temp={weather.temp} 
        conditions={weather.conditions} 
        loc={weather.loc}
        time={weather.time}
        wind={weather.wind}
        wind_dir={weather.wind_dir}
        color_temp={weather.colortemp}
        key={weather.key}
        id={weather.key}
        ref={"weather-"+(weather.key)}
        >

        </WeatherItem>
        );

    });
     return (
      <div>
        <div id="weather-bg">
          <WeatherBG ref={'bg'}></WeatherBG>
        </div>
        <div className="weather-list" style={divStyles}>
          {weatherNodes}
        </div>
      </div>
      ); 
   }

 }
});

ReactDOM.render(
  <WeatherList url="/api/get_weather" pollInterval={5000}/>, 
  document.getElementById('content')
  );