var Search = React.createClass({
    render: function(){
        <div><input ref={search}/>search would go here</div>
    }
});

var SearchPanel = React.createClass({
    render: function(){
        <div><Search/></div>
    }
});
