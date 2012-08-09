// customize ROS Connection
ros.Connection.prototype.close = function(func) {
  this.socket.close();
}

var selected_level = {Debug:true, Info:true, Warn:true, Error:true, Fatal:true};
var is_paused = false;
var connection = null;
var max_message_count = 1000;


function getCookie(key) {
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
}

$(function() {
    (function(){
       $('.nav-tabs').button();
       $(".alert").alert();
       $(".collapse").collapse();
       $('#level_buttons > .btn').button('toggle');

       $('#rosout_table').css('table-layout', 'fixed');
       // set initial value from cookie
       if (getCookie("hostname") == "") {
	 $('#hostname').val("localhost");
       } else {
	 console.log("using cookie" + getCookie("hostname"));	 
	 $('#hostname').val(getCookie("hostname"));
       }

       $("#bottom_items").css('position', 'fixed');
       $("#bottom_items").css('bottom', 0);
       $("#bottom_items").css('height', 100);

       $('#set_hostname').submit(
	 function(){
	   var hostname = $('#hostname').val();
	   document.cookie = "hostname=" + hostname + ";";
	   rosInitialize(hostname);
	   return false;
	 });

       $('#level_buttons > .btn').click(
         function(){
	   selected_level[$(this).text()] = !selected_level[$(this).text()];
	   $(this).button('toggle');
	  });
       $('#pause_button').click(function(){
				  is_paused = !is_paused;
				  $(this).button('toggle');
				});
//       rosInitialize('localhost');
     }());
  });


function rosInitialize(host) {
  if (connection != null) {
    connection.close();
  }
  var message_count = 0;
  var uri = "ws://" + host + ":9090";
  connection = new ros.Connection(uri);

  $('#rosout_table > tbody:last').html("");

  connection.setOnClose(function (e) {
			  $('#message').append('<div class="alert alert-block alert-error">'
					     + '<a class="close" data-dismiss="alert" href="#">x</a>'
					     + '<strong>Error!</strong> rosbridge connection closed</div>');
			});
  
  connection.setOnError(function (e) {
			  $('#message').append('<div class="alert alert-block alert-error">'
					     + '<a class="close" data-dismiss="alert" href="#">x</a>'
					     + '<strong>Error!</strong> rosbridge error has occered</div>');
			});
  connection.setOnOpen(
    function (e) {
      try {
	connection.addHandler('/rosout_agg',
			      function(msg) {
				
				if ((!is_paused) && selected_level[levelToString(msg.level)]) {
				  $('#rosout_table > tbody:last').append(
				    '<tr>' +
				      '<td><i class="' + levelToIcon(msg.level) +
				      '"></i>' + 
				      '<a data-toggle="collapse" data-target="#message' + message_count + '">' + msg.msg + '</a>' + 
				      '<div id="message' + message_count + '" class="collapse">' + 
				      '<p><strong>Node:</strong>' + msg.name + '</p>' +
				      '<p><strong>Time:' + msg.header.stamp.secs + '.' +
				      msg.header.stamp.nsecs + '</p>' +
				      '<p><strong>Severity:</strong>' + levelToString(msg.level) + '</p>' +
				      '<p><strong>Location</strong>' + msg.file + ':in `' + msg.function + "\':" + msg.line + '</p>' +
				      '<p><strong>Published Topics:</strong>' + msg.topics + '</p>' +
				      '</div>' + 
				      '</td>' +
				      '<td><span class="label ' +
				      levelToLabel(msg.level) + '">'
				      + levelToString(msg.level) + '</span></td>' +
				      '<td>' + msg.name + '</td>' +
				      '</tr>');
				  $('html, body').animate({scrollTop: $("#message").offset().top}, 0);
				  message_count++;
				  if (message_count > max_message_count) {
				    $('#rosout_table > tbody').contents().first().remove();
				  }
				}
			      });
      } catch(error) {
	console.error('problem in registering');
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
      document.title = "wxconsole " + uri;
    });
}

function levelToLabel(level) {
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
}


function levelToString(level) {
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

function levelToIcon(level) {
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
}
