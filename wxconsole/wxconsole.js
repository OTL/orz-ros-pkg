// Copyright 2012 OTL. 
// 
// @license BSD license
// 
// @author Takashi Ogura <t.ogura@gmail.com>

var wxconsole = {};

wxconsole.getCookie = function(key) {
  var cookieString = document.cookie;
  var cookieKeyArray = cookieString.split(';');
  for (var i=0; i<cookieKeyArray.length; i++) {
    var targetCookie = cookieKeyArray[i];
    targetCookie = targetCookie.replace(/^\s+|\s+$/g, '');
    var valueIndex = targetCookie.indexOf("=");
    if (targetCookie.substring(0, valueIndex) == key) {
      return unescape(targetCookie.slice(valueIndex + 1));
    }
  }
  return '';
};

wxconsole.levelToString = function(level) {
  if (level >= 16) {
    return 'Fatal';
  } else if (level >= 8) {
    return 'Error';
  } else if (level >= 4) {
    return 'Warn';
  } else if (level >= 2) {
    return 'Info';
  } else if (level >= 1) {
    return 'Debug';
  }
  return 'Unknown';
}

wxconsole.levelToTBIcon = function(level) {
  var dict = {
    Unknown : 'icon-leaf',
    Debug : 'icon-pencil',
    Info : 'icon-info-sign',
    Warn : 'icon-exclamation-sign',
    Error : 'icon-remove-sign',
    Fatal : 'icon-remove',
  };

  return dict[wxconsole.levelToString(level)];
};


/**
 * convert severity level to TwitterBootstrap lavel name
 */
wxconsole.levelToTBLabel = function(level) {
  var dict = {
    Unknown : '',
    Debug : '',
    Info : 'label-info',
    Warn : 'label-warning',
    Error : 'label-important',
    Fatal : 'label-inverse'
  };

  return dict[wxconsole.levelToString(level)];
};

wxconsole.messageToHTML = function(msg) {
  return '<p><strong>Node: </strong>' + msg.name + '</p>' +
    '<p><strong>Time: </strong>' + msg.header.stamp.secs + '.' +
    msg.header.stamp.nsecs + '</p>' +
    '<p><strong>Severity: </strong>' + wxconsole.levelToString(msg.level) + '</p>' +
    '<p><strong>Location: </strong>' + msg.file + ':in `' + msg.function + "\':" + msg.line + '</p>' +
    '<p><strong>Published Topics: </strong>' + msg.topics + '</p>' +
    '<p /><h3>' + msg.msg + '</h3>';
};

/**
 * 
 * @constructor
 */
wxconsole.Console = function(host, port) {
  this.MaxNumberOfDisplayedMessages = 500;
  this.titleString = 'wxconsole';
  this.isPaused = false;
  this.tableId = 'rosout_table';
  this.messageId = 'message';

  var selectedLevel_ = {Unknown:true,
			Debug:true,
			Info:true,
			Warn:true,
			Error:true,
			Fatal:true};

  var numberOfReceivedMessages_ = 0;
  var uri_ = "ws://" + host + ":" + port.toString();
  var self = this;

  this.getUri = function() {
    return uri_;
  };

  this.toggleSelectedLevel = function(levelText){
    selectedLevel_[levelText] = !selectedLevel_[levelText];
  };

  this.togglePause = function(){
    this.isPaused = !this.isPaused;
  };

  this.onCloseCallback = function() {
    $('#' + self.messageId).append(
      '<div class="alert alert-block alert-error">'
	+ '<a class="close" data-dismiss="alert" href="#">x</a>'
	+ '<strong>Error!</strong> rosbridge connection closed</div>');
  };

  this.onErrorCallback = function (e) {
    $('#' + self.messageId).append(
      '<div class="alert alert-block alert-error">'
	+ '<a class="close" data-dismiss="alert" href="#">x</a>'
	+ '<strong>Error!</strong> rosbridge error has occered</div>');
  };

  this.onMessageCallback = function(msg) {
    if ((!self.isPaused) && 
      selectedLevel_[wxconsole.levelToString(msg.level)]) {
      $('#' + self.tableId + ' > tbody:last').append(
	'<tr>' +
	  '<td><i class="' + wxconsole.levelToTBIcon(msg.level) +
	  '"></i>' + 
	  '<a onclick="$(\'#modal_message' + numberOfReceivedMessages_ + '\').modal()">' + msg.msg + '</a>' + 
	  '<div id="modal_message' + numberOfReceivedMessages_ + '" class="modal hide">' + 
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
      $('html, body').animate({scrollTop: $('#' + self.messageId).offset().top}, 0);
      numberOfReceivedMessages_++;
      if (numberOfReceivedMessages_ >
	  self.MaxNumberOfDisplayedMessages) {
	$('#' + self.tableId + ' > tbody').contents().first().remove();
      }
    }
  };

  this.onConnectedCallback = function() {
    $('#' + self.messageId).append(
      '<div class="alert alert-block alert-success id="connection_alert">'
	+ '<a class="close" data-dismiss="alert" href="#">x</a>'
	+ '<strong>Success!</strong> rosbridge connection established</div>');
    $('#' + self.messageId).children().delay(3000).fadeOut(1000);
    document.title = self.titleString + " " + uri_;
  };

  this.init = function(){
    $('#' + self.tableId + ' > tbody:last').html("");
  };
};

