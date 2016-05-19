
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
    console.log('updating')
    
  },
  componentWillUnmount: function(){
    this._leaveStyle();
    console.log('unmounting 2', this)
  },
  getStyles: function(){

    var styles = {
      background: this.state.bgcolor
    }
    return styles
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
  render: function(){
    var divStyle = {
      backgroundColor: this.props.color_temp
    }
    return (            
      <div className = {this.getClasses()} ref={this.props.id} style={divStyle}>
        <div>
          <div className = "temp">
            {this.props.temp}&deg;F
          </div>
          <div className = "conditions">
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
var WeatherList = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      loading: true,
      selected: ''
    };
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
      loc['key'] = key
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
  handleClick: function(e){
    console.log('clicked',e.target.className)
    var node = e.target
    if (e.target.classList.contains('weather-container')){
      var index = [].slice.call(node.parentNode.children).indexOf(node);
      this.setSelected(index);    
    }

  },
  setSelected: function(index){
    console.log('select',index)
    this.setState({selected: "weather-"+index})
    for (var key in this.refs){
      this.refs[key].setState({selected:false})
    }
    this.refs['weather-'+index].setState({selected:true})
  },
  componentDidMount: function(){
    this.loadWeather();
    this.setState({loading: false})
    setInterval(this.loadWeather, this.props.pollInterval);
  },

  render: function(){
    //console.log('render',this)
    var dataArr=this.prepWeatherData(this.state.data);
    var index = 0
    var self = this;
    if (this.state.loading){
      return (
        <div className="loading">loading...</div>
        );
    } else {
     var weatherNodes = dataArr.map(function(weather) {
      //console.log(weather)
      return (
        <WeatherItem 
        temp={weather.temp} 
        conditions={weather.conditions} 
        loc={weather.loc}
        time={weather.time}
        wind={weather.wind}
        wind_dir={weather.wind_dir}
        color_temp={weather.colortemp}
        key={index}
        id={index}
        ip={weather.key}
        ref={"weather-"+(index++)}
        >

        </WeatherItem>
        );

    });
     return (

      <div className="weather-list" onClick={this.handleClick}>
        {weatherNodes}
      </div>
      ); 
   }

 }
});

ReactDOM.render(
  <WeatherList url="/api/get_weather" pollInterval={5000}/>, 
  document.getElementById('content')
  );