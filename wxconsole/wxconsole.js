// Copyright 2012 OTL. 
// 
// @license BSD license
// 
// @author Takashi Ogura <t.ogura@gmail.com>


$(function() {
    (function(){
       var wx = null;
       $('.nav-tabs').button();
       $(".alert").alert();
//       $(".collapse").collapse();
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
	   wx = new wxconsole.Console(hostname);
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
	 console.log("using cookie" + savedHostName);
	 $('#hostname').val(savedHostName);
	 wx = new wxconsole.Console(savedHostName);
	 wx.init();
       }

     }());
  });

var wxconsole = {};

wxconsole.getCookie = function(key) {
  var cookieString = document.cookie;
  var cookieKeyArray = cookieString.split(";");
  for (var i=0; i<cookieKeyArray.length; i++) {
    var targetCookie = cookieKeyArray[i];
    targetCookie = targetCookie.replace(/^\s+|\s+$/g, "");
    var valueIndex = targetCookie.indexOf("=");
    if (targetCookie.substring(0, valueIndex) == key) {
      return unescape(targetCookie.slice(valueIndex + 1));
    }
  }
  return "";
};

wxconsole.levelToString = function(level) {
  if (level <= 1) {
    return 'Debug';
  } else if (level <= 2) {
    return 'Info';
  } else if (level <= 4) {
    return 'Warn';
  } else if (level <= 8) {
    return 'Error';
  } else if (level <= 16) {
    return 'Fatal';
  }
  return "Unknown";
}

wxconsole.levelToIcon = function(level) {
  if (level <= 1) {
    return "icon-pencil";
  } else if (level <= 2) {
    return "icon-info-sign";
  } else if (level <= 4) {
    return "icon-exclamation-sign";
  } else if (level <= 8) {
    return "icon-remove-sign";
  } else if (level <= 16) {
    return "icon-remove";
  }
  return "icon-leaf";
};

wxconsole.messageToHTML = function(msg) {
return '<p><strong>Node: </strong>' + msg.name + '</p>' +
    '<p><strong>Time: </strong>' + msg.header.stamp.secs + '.' +
    msg.header.stamp.nsecs + '</p>' +
    '<p><strong>Severity: </strong>' + wxconsole.levelToString(msg.level) + '</p>' +
    '<p><strong>Location </strong>' + msg.file + ':in `' + msg.function + "\':" + msg.line + '</p>' +
    '<p><strong>Published Topics: </strong>' + msg.topics + '</p>' +
    '<p /><p>' + msg.msg + '</p>';
};

/**
 * convert severity level to TwitterBootstrap lavel name
 */
wxconsole.levelToTBLabel = function(level) {
  if (level <= 1) {
    return '';
  } else if (level <= 2) {
    return 'label-info';
  } else if (level <= 4) {
    return 'label-warning';
  } else if (level <= 8) {
    return 'label-important';
  } else if (level <= 16) {
    return 'label-inverse';
  }

  return '';
};

/**
 * 
 * @constructor
 */
wxconsole.Console = function(host) {
  this.WS_PORT = 9090;
  this.MAX_NUMBER_OF_DISPLAYED_MESSAGES_ = 500;

  this.selectedLevel_ = {Debug:true, Info:true, Warn:true, Error:true, Fatal:true};
  this.isPaused_ = false;
  this.connection_ = null;
  this.numberOfDisplayedMessages_ = 0;
  this.uri_ = "ws://" + host + ":" + this.WS_PORT.toString();
};


wxconsole.Console.prototype.close = function(levelText){
  if (this.connection_ != null) {
    console.log('closed!');
    this.connection_.socket.close();
    this.connection_.handlers = new Array();
  }
};

wxconsole.Console.prototype.toggleSelectedLevel = function(levelText){
  this.selectedLevel_[levelText] = !this.selectedLevel_[levelText];
};

wxconsole.Console.prototype.togglePause = function(){
  this.isPaused_ = !this.isPaused_;
};

wxconsole.Console.prototype.init = function(){
  this.close();

  this.connection_ = new ros.Connection(this.uri_);
  var connection = this.connection_;
  var wx = this;

  $('#rosout_table > tbody:last').html("");

  connection.setOnClose(
    function (e) {
      $('#message').append('<div class="alert alert-block alert-error">'
			   + '<a class="close" data-dismiss="alert" href="#">x</a>'
			   + '<strong>Error!</strong> rosbridge connection closed</div>');
    });
  
  connection.setOnError(
    function (e) {
      $('#message').append('<div class="alert alert-block alert-error">'
			   + '<a class="close" data-dismiss="alert" href="#">x</a>'
			   + '<strong>Error!</strong> rosbridge error has occered</div>');
    });

  connection.setOnOpen(
    function (e) {
      try {
	connection.addHandler(
	  '/rosout_agg',
	  function(msg) {
	    if ((!wx.isPaused_) && 
	      wx.selectedLevel_[wxconsole.levelToString(msg.level)]) {
	      $('#rosout_table > tbody:last').append(
		'<tr>' +
		  '<td><i class="' + wxconsole.levelToIcon(msg.level) +
		  '"></i>' + 
		  '<a onclick="$(\'#message' + wx.numberOfDisplayedMessages_ + '\').modal()">' + msg.msg + '</a>' + 
		  '<div id="message' + wx.numberOfDisplayedMessages_ + '" class="modal hide">' + 
		    '<div class="modal-header">'+
		      '<button type="button" class="close" data-dismiss="modal">x</button>' +
		      '<h3>Message</h3>' +
		    '</div>' +
                    '<div class="modal-body">' +
		      wxconsole.messageToHTML(msg) +
		    '</div>' + 
		    '<div class="modal-footer">'+
		      '<a href=\"#\" class=\"btn\" data-dismiss="modal">Close</a>' +
		    '</div>' +		  
		  '</div>' + 
		  '</td>' +
		  '<td><span class="label ' +
		  wxconsole.levelToTBLabel(msg.level) + '">'
		  + wxconsole.levelToString(msg.level) + '</span></td>' +
		  '<td>' + msg.name + '</td>' +
		  '</tr>');
	      $('html, body').animate({scrollTop: $("#message").offset().top}, 0);
	      wx.numberOfDisplayedMessages_++;
	      if (wx.numberOfDisplayedMessages_ >
		  wx.MAX_NUMBER_OF_DISPLAYED_MESSAGES_) {
		$('#rosout_table > tbody').contents().first().remove();
	      }
	    }
	  });
      } catch(error) {
	console.error('problem in registering: ' + error);
	return;
      }
      try {
	connection.callService('/rosjs/subscribe',
			       '["/rosout_agg",-1]',
			       function(e){});
      } catch (error) {
	console.error('Problem subscribing!');
      }
      $('#message').append('<div class="alert alert-block alert-success id="connection_alert">'
			 + '<a class="close" data-dismiss="alert" href="#">x</a>'
			 + '<strong>Success!</strong> rosbridge connection established</div>');
      $('#message').children().delay(3000).fadeOut(1000);
      document.title = "wxconsole " + wx.uri_;
    });
};

