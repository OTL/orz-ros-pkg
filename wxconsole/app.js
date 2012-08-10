$(function() {
    (function(){
       var wx = null;
       $('.nav-tabs').button();
       $(".alert").alert();
       $('#level_buttons > .btn').button('toggle');
       
       $('#rosout_table').css('table-layout', 'fixed');

       $("#bottom_items").css('position', 'fixed');
       $("#bottom_items").css('bottom', 0);
       $("#bottom_items").css('height', 100);
       $('#set_hostname').submit(
	 function(){
	   var hostname = $('#hostname').val();
	   document.cookie = "hostname=" + hostname + ";";
	   if (wx != null){
	     wx.close();
	     delete wx;
	   }
	   wx = new wxconsole.App(hostname, 9090);
	   wx.init();
	   return false;
	 });

       $('#level_buttons > .btn').click(
         function(){
	   wx.toggleSelectedLevel($(this).text());
	   $(this).button('toggle');
	  });
       $('#pause_button').click(function(){
				  wx.togglePause();
				  $(this).button('toggle');
				});

       // set initial value from cookie
       var savedHostName = wxconsole.getCookie("hostname");
       if (savedHostName == "") {
	 $('#hostname').val("localhost");
       } else {
	 console.log("using cookie: " + savedHostName);
	 $('#hostname').val(savedHostName);
	 wx = new wxconsole.App(savedHostName, 9090);
	 wx.init();
       }
     }());
  });


wxconsole.App = function(host, port) {
  var controller_ = new wxconsole.Console(host, port);
  var conection_ = null;

  this.close = function(levelText){
    if (connection_ != null) {
      connection_.socket.close();
      connection_.handlers = new Array(); // rosws bug?
    }
  };

  this.toggleSelectedLevel = function(levelText){
    controller_.toggleSelectedLevel(levelText);
  };

  this.togglePause = function(){
    controller_.togglePause();
  };

  this.init = function(){
    var ROSOUT_TOPIC = '/rosout_agg';

    controller_.init();

    close();
    connection_ = new ros.Connection(controller_.getUri());
    // clear 
    connection_.setOnClose(controller_.onCloseCallback);
    connection_.setOnError(controller_.onErrorCallback);
    
    connection_.setOnOpen(
      function (e) {
	try {
	  connection_.addHandler(ROSOUT_TOPIC, controller_.onMessageCallback);
	} catch(error) {
	  console.error('problem in registering: ' + error);
	  return;
	}
	try {
	  connection_.callService('/rosjs/subscribe',
				  [ROSOUT_TOPIC, -1],
				  function(e){});
	} catch (error) {
	  console.error('Problem subscribing!');
	}
	controller_.onConnectedCallback();
      });
    };
};
