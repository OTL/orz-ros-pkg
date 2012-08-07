var selected_level = {Debug:true, Info:true, Warn:true, Error:true, Fatal:true};
var is_paused = false;
var connection = null;

Connection.prototype.close = function(func) {
  this.socket.close();
}

$(function() {
    (function(){
       $('.nav-tabs').button();
       $(".alert").alert();
       
       $('#level_buttons > .btn').button('toggle');
       $('#connect').click(
	 function(){
	   rosInitialize($('#hostname').val());
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
  connection = new ros.Connection("ws://" + host + ":9090");

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
				      '"></i>' + msg.msg + '</td>' +
				      '<td><span class="label ' +
				      levelToLabel(msg.level) + '">'
				      + levelToString(msg.level) + '</span></td>' +
				      '<td>' + msg.name + '</td>' +
				      '<td>' + msg.header.stamp.secs + '.' +
				      msg.header.stamp.nsecs + '</td>' +
				      '<td>' + msg.topics + '</td>' +
				      '<td>' + msg.file + ':in `' + msg.function + "\':" + msg.line + '</td>' +

				      '</tr>');
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
      $('#message').append('<div class="alert alert-block alert-success">'
			 + '<a class="close" data-dismiss="alert" href="#">x</a>'
			 + '<strong>Success!</strong> rosbridge connection established</div>');
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
    return 'label-important';
  }

  return ''
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
