var SelectNode = function(){};
var SearchLocation = function(){};
var SelectAbout = function(){};

MicroEvent.mixin(SelectNode);
MicroEvent.mixin(SearchLocation);
MicroEvent.mixin(SelectAbout);

var selectNode = new SelectNode();
var searchLocation = new SearchLocation();
var selectAbout = new SelectAbout();

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
var Search = React.createClass({
  getInitialState: function(){
    return {
      searchInput: 'invisible',
      searchIcon: 'visible',
      searchValue: ''
    }
  },
  shouldComponentUpdate: function(nextProps, nextState){
      return true
  },
  handleSearchVisible: function(){
    this.refs['searchInput'].value = ''
    if (this.state.searchInput == 'invisible'){
      this.setState({searchInput: 'visible'})
      this.setState({searchIcon: 'invisible'})
      this.refs['searchInput'].focus(); 
    } else {
      this.setState({searchInput: 'invisible'})
      this.setState({searchIcon: 'visible'})
    }

  },
  handleEnter: function(e){
    
    if (e.keyCode == 13){
      var thisVal = e.target.value
      this.setState({searchValue: thisVal})
      this.refs['searchInput'].blur()
      searchLocation.trigger('search', thisVal);
    }
  },
  render: function(){

    var icon = 'fontello icon-search '+this.state.searchIcon
    var searchClasses = 'search-input '+this.state.searchInput
    return (
      <div className='search-container'>
        <input 
          className={searchClasses} 
          ref={'searchInput'} 
          id={'search-input'}
          placeholder={'e.g., New York, NY or Paris, France'}
          
          onBlur={this.handleSearchVisible}
          onKeyDown={this.handleEnter}/>
        <div 
          className={icon} 
          ref={'searchIcon'} 
          id={'search'} 
          onClick={this.handleSearchVisible}/>
      </div>
    )
  }
});
var WMessage = React.createClass({
  getDefaultProps: function(){
    return {
      delay: 3000
    }
  },
  getInitialState: function(){
    return {
      visible: false,
      msg: null
    }
  },
  render: function(){
    var msg = this.state.msg ? this.state.msg : ''
    
    return (
      <div>
        <p>{msg}</p>
      </div>
    )
  }
});
var Github = React.createClass({
  render: function(){
    var url = 'https://github.com/juniferd/multi-weather'
    return (
        <div>
        <a href={url} target={'_blank'}><div className={this.props.icon} id={'github'}/></a>
        </div>
    )
  }
});
var About = React.createClass({
  getInitialState: function(){
    return {
      aboutIcon: ''
    }
  },
  handleClick: function(){
    if (this.state.aboutIcon == 'selected') {
      this.setState({aboutIcon: ''})
      selectAbout.trigger('select', 'invisible');
    } else {
      this.setState({aboutIcon: 'selected'});
      selectAbout.trigger('select', 'visible');
    }
    
  },
  componentWillMount: function(){
    var self = this;
    selectAbout.bind('close', function(t){
      self.setState({aboutIcon: t})
    });
  },
  componentWillUnmount: function(){
    selectNode.unbind('close', function(){})
  },
  render: function(){
    var iconClass = 'fontello icon-info-circled '+this.state.aboutIcon
    return (
      <div 
      className={iconClass} 
      id={'about'} 
      ref={'about'}
      onClick={this.handleClick}/>
    )
  }
});
var Modal = React.createClass({
  getInitialState: function(){
    return {
      isVisible: 'invisible'
    }
  },
  componentWillMount: function(){
    var self = this;
    selectAbout.bind('select', function(t){
      self.setState({isVisible: t})
    });
  },
  componentWillUnmount: function(){
    selectAbout.unbind('select', function(){});
  },
  handleClick: function(){
    var self = this;
    if (this.state.isVisible == 'invisible'){
      this.setState({isVisible: 'visible'})
      selectAbout.trigger('close', 'selected')
    } else {
      this.setState({isVisible: 'invisible'})
      selectAbout.trigger('close', '')
    }
  },
  render: function(){
    var modalClass = 'modal '+this.state.isVisible;
    var link = 'https://www.wunderground.com/weather/api';
    var meteocon = 'http://www.alessioatzeni.com/meteocons/';
    return (
      <div className={modalClass}>
        <div className={'close-button'} ref={'close'} onClick={this.handleClick}/>
        <p>This app displays current conditions based on locations of connected users</p>
        <p>Weather data from <a href={link} target={'_blank'}>wunderground</a></p>
        <p>Meteocon weather icons from <a href={meteocon} target={'_blank'}>here</a></p>
      </div>
    )
  }
});
var WeatherList = React.createClass({
  getInitialState: function() {
    var numNodesPerRow = Math.floor(window.innerWidth/220)
    var w = numNodesPerRow*220
    return {
      data: [],
      loading: true,
      selected: '',
      winWidth: w
    };
  },
  setWinWidth: function(nodeCount){
    var numNodesPerRow = Math.floor(window.innerWidth/220)
    var w = nodeCount >= numNodesPerRow ? numNodesPerRow*220 : nodeCount*220
    this.setState({winWidth: w});
  },
  handleResize: function(){
    var nodeCount = 0
    for (var key in this.refs){
      if (key.startsWith('weather-')){
        nodeCount++
      }
    }
    this.setWinWidth(nodeCount)
  },
  setMessage: function(msg){
    this.refs['message'].setState({msg: msg});
  },
  loadWeather: function(){
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data, status, xhr){
        this.setState({data:data});
        var thisCount = 0
        for (var key in data){
          thisCount++
        }
        this.setWinWidth(thisCount)
        if (xhr.status == '202'){
          //this.setMessage('Could not find your location')
          //TODO how to update this without constantly looping
        }
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
  handleSearchLocation: function(thisVal){
    $.ajax({
      url: '/api/get_weather_in_city',
      dataType: 'json',
      cache: false,
      data: {query: thisVal},
      success: function(data){
        console.log('great success',data)
        //TODO: trigger messages depending on returned data
      }.bind(this),
      error: function(xhr,status,err){
        console.error('/api/get_weather_in_city',status, err.toString());
      }.bind(this)
    });
  },
  componentWillMount: function(){
    this.loadWeather();
    this.setState({loading: false});

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
    searchLocation.bind('search', function(searchVal){
      self.handleSearchLocation(searchVal)
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
    searchLocation.unbind('search',function(){});
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
        <div className="info">
          <Github ref={'github'} icon={'fontello icon-github'}/>
          <Search ref={'search'}/>
          <About ref={'about'} icon={'fontello icon-info-circled'}/>
        </div>
        <div className="msg">
          <WMessage ref={'message'} delay={3000}/>
        </div>
        <div>
          <Modal ref={'modal'}/>
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