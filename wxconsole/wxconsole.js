// Copyright 2012 OTL. 
// 
// @license BSD license
// 
// @author Takashi Ogura <t.ogura@gmail.com>

/**
 * namespace of wxconsole
 */
var wxconsole = {};

/**
 * Convert rosgraph_msgs/Log level byte to String
 * 
 * @param {Number} level level of Log
 * @returns {String} debug level Fatal/Error/Warn/Info/Debug/Unknown(for error)
 */
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

/**
 * Returns Twitterbootstrap's icon class from Log level
 * @param {Number} level level of Log
 * @returns {String} Twitterbootstrap's icon class string
 */
wxconsole.levelToTBIcon = function(level) {
  var dict = {
    Unknown : 'icon-leaf',
    Debug : 'icon-pencil',
    Info : 'icon-info-sign',
    Warn : 'icon-exclamation-sign',
    Error : 'icon-remove-sign',
    Fatal : 'icon-remove'
  };

  return dict[wxconsole.levelToString(level)];
};


/**
 * Converts Log severity level to TwitterBootstrap label name
 * @param {Number} level level of Log
 * @returns {String} Twitterbootstrap's label class string
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

/**
 * Generate HTML for modal from message
 * @param {rosgraph_msgs/Log} msg ros message
 * @returns {String} HTML
 */
wxconsole.messageToHTML = function(msg) {
  return '<p><strong>Node: </strong>' + msg.name + '</p>' +
    '<p><strong>Time: </strong>' + msg.header.stamp.secs + '.' +
    msg.header.stamp.nsecs + '</p>' +
    '<p><strong>Severity: </strong>' + wxconsole.levelToString(msg.level) + '</p>' +
    '<p><strong>Location: </strong>' + msg.file + ':in `' + msg.function + "\':" + msg.line + '</p>' +
    '<p><strong>Published Topics: </strong>' + msg.topics + '</p>' +
    '<p /><h3>' + msg.msg + '</h3>';
};

wxconsole.MakeWebsocketUri = function(host, port) {
  return "ws://" + host + ":" + port.toString();
};

/**
 * @class Message Converter
 * @param {Number} bufferSize number of messaged for displayed
 */
wxconsole.MessageHTMLConverter = function(bufferSize) {
  if (bufferSize == null){
    this.MaxNumberOfDisplayedMessages = 500; 
  } else {
    this.MaxNumberOfDisplayedMessages = bufferSize;
  }

  /**
   * browser title
   * @type String
   */
  this.titleString = 'wxconsole';

  /**
   * id of table for display
   * @type String
   */
  this.tableId = 'rosout_table';
  /**
   * id of message field
   * @type String
   */
  this.messageId = 'message';

  this.isPaused = false;

  var selectedLevel_ = {Unknown:true,
			Debug:true,
			Info:true,
			Warn:true,
			Error:true,
			Fatal:true};

  var numberOfReceivedMessages_ = 0;
  var self = this;

  /**
   * Toggles paused/resumed state of level
   * @param {String} levelText one of Debug/Info/Warn/Error/Fatal
   */
  this.toggleSelectedLevel = function(levelText){
    selectedLevel_[levelText] = !selectedLevel_[levelText];
  };

  /**
   * Toggles all pause/resume state
   */
  this.togglePause = function(){
    self.isPaused = !self.isPaused;
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

  this.generateTableRowFromMessage = function(msg) {
    return '<tr>' +
      '<td><i class="' + wxconsole.levelToTBIcon(msg.level) +
      '"></i>' + 
      '<a onclick="$(\'#modal_message' + numberOfReceivedMessages_ + '\').modal()" class="' + wxconsole.levelToString(msg.level) + '">' + msg.msg + '</a>' + 
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
      '</tr>';
  };

  this.onMessageCallback = function(msg) {
    if ((!self.isPaused) && 
      selectedLevel_[wxconsole.levelToString(msg.level)]) {
      $('#' + self.tableId + ' > tbody:last').append(self.generateTableRowFromMessage(msg));
      $('html, body').animate({scrollTop: $('#' + self.messageId).offset().top}, 0);
      numberOfReceivedMessages_++;
      if (numberOfReceivedMessages_ >
	  self.MaxNumberOfDisplayedMessages) {
	$('#' + self.tableId + ' > tbody').contents().first().remove();
      }
    }
  };

  this.onConnectedCallback = function() {
    $('#' + self.messageId).children().fadeOut(100);
    $('#' + self.messageId).append(
      '<div class="alert alert-block alert-success id="connection_alert">'
	+ '<a class="close" data-dismiss="alert" href="#">&times</a>'
	+ '<strong>Success!</strong> rosbridge connection established</div>');
    $('#' + self.messageId).children().delay(3000).fadeOut(1000);
    document.title = self.titleString;
  };

  this.clear = function(){
    $('#' + self.tableId + ' > tbody:last').html("");
  };
};

/**
 * @class connection controller for rosbridge version1
 * 
 */
wxconsole.Rosbridge1Adaptor = function(host, port, topic, bufferSize) {
  var topic_ = topic;
  if (topic_ == null) {
    topic_ = '/rosout_agg';
  };
  this.host = host;
  this.port = port;

  var conection_ = null;
  var self = this;

  /**
   * version name of rosbridge
   * @description this is used in html id. if you want to change this, 
   * check html source.
   * @type {String}
   */
  this.ROSBRIDGE_VERSION = '1.0';
  this.controller = new wxconsole.MessageHTMLConverter(bufferSize);

  /**
   * rosout's topic name
   * @returns {String} topic name
   */
  this.getTopic = function(){
    return topic_;
  };

  /**
   * Changes topic name. unsubscribe and subscribe new topic.
   * @param {String} name new topic name
   */
  this.setTopic = function(name){
    connection_.handlers = new Array();
    topic_ = name;
    connection_.callService('/rosjs/subscribe',
			    [topic_, -1],
			    function(e){});
    connection_.addHandler(topic_, self.controller.onMessageCallback);
  };

  /**
   * close the websocket connection
   */
  this.close = function(){
    if (connection_ != null) {
      connection_.socket.close();
      connection_.handlers = new Array(); // rosws bug?
    }
  };

  /**
   * Initialize connection
   */
  this.init = function(){
    self.controller.clear();

    close();
    connection_ = new ros.Connection(
      wxconsole.MakeWebsocketUri(self.host, self.port));
    // clear 
    connection_.setOnClose(self.controller.onCloseCallback);
    connection_.setOnError(self.controller.onErrorCallback);
    
    connection_.setOnOpen(
      function (e) {
	try {
	  connection_.addHandler(topic_, self.controller.onMessageCallback);
	  connection_.callService('/rosjs/subscribe',
				  [topic_, -1],
				  function(e){});
	} catch (error) {
	  console.error('Problem subscribing!');
	  return;
	}
	self.controller.onConnectedCallback();
      });
    };
};


/**
 * @class connection controller for rosbridge version2
 * @param {String} host
 * @param {Number} port
 * @param {String} topic
 * @param {Number} bufferSize
 */
wxconsole.Rosbridge2Adaptor = function(host, port, topic, bufferSize) {
  var topic_ = topic;
  var conection_ = null;
  var self = this;

  this.host = host;
  this.port = port;

  if (topic_ == null) {
    topic_ = '/rosout_agg';
  };

  /**
   * version name of rosbridge
   * @description this is used in html id. if you want to change this, 
   * check html source.
   * @type {String}
   */
  this.ROSBRIDGE_VERSION = '2.0';
  this.controller = new wxconsole.MessageHTMLConverter(bufferSize);

  /**
   * Returns name of subscribing topic name
   * @returns {String} current topic name
   */
  this.getTopic = function(){
    return topic_;
  };

  /**
   * Changes the topic name 
   * @param {String} name name of new topic
   */
  this.setTopic = function(name){
    connection_.unsubscribe(topic_);
    topic_ = name;
    connection_.subscribe(self.controller.onMessageCallback,
			  topic_);
  };

  /**
   * unsubscribe and close
   */
  this.close = function() {
    if (connection_ != null) {
      connection_.unsubscribe(topic_);
      connection_.socket.close();
    }
  };

  /**
   * initialize and connect to websocket
   */
  this.init = function(){

    self.controller.clear();

    close();
    connection_ = new ros.Bridge(
      wxconsole.MakeWebsocketUri(self.host, self.port));
    // clear 
    connection_.onClose = self.controller.onCloseCallback;
    connection_.onError = self.controller.onErrorCallback;
    
    connection_.onOpen =
      function (e) {
	try {
	  connection_.subscribe(self.controller.onMessageCallback,
				topic_);
	} catch(error) {
	  console.error('problem in registering: ' + error);
	  return;
	}
	self.controller.onConnectedCallback();
      };
    };
};

/**
 * select adaptor by rosbridge version
 * @param {String} version version string 1.0 or 2.0
 */
wxconsole.setRosbridgeVersion = function(version) {
  if (version == '1.0') {
    wxconsole.Adaptor = wxconsole.Rosbridge1Adaptor;
  } else if (version == '2.0') {
    wxconsole.Adaptor = wxconsole.Rosbridge2Adaptor;
  } else {
    console.error('unsupportd rosbridge version');
  }
};

/**
 * @class wxconsole Application class
 */
wxconsole.App = function() {
  var adaptor = null;
  var port = 9090;

  $('.nav-tabs').button();
  $(".alert").alert();
  $('#level_buttons > .btn').button('toggle');
  
  $('#rosout_table').css('table-layout', 'fixed');
  $("#bottom_items").css('position', 'fixed');
  $("#bottom_items").css('bottom', 0);
  $("#bottom_items").css('height', 100);

  var version = $.cookie('rosbridgeVersion');
  if (version == null) {
    if (ros.Connection != undefined) {
      wxconsole.setRosbridgeVersion('1.0');
    } else if (ros.Bridge != undefined) {
      wxconsole.setRosbridgeVersion('2.0');
    } else {
      console.error('ros.js is not included');
    }
  } else {
    wxconsole.setRosbridgeVersion(version);
  }

  // set initial value from cookie
  var cookiePortNumber = $.cookie('portNumber');
  if (cookiePortNumber) {
    port = cookiePortNumber;
  }
  var savedHostName = $.cookie('hostname');
  if (savedHostName == "") {
    $('#hostname').val("localhost");
  } else {
    console.log("using cookie: " + savedHostName);
    $('#hostname').val(savedHostName);
    adaptor = new wxconsole.Adaptor(savedHostName, port);
    adaptor.init();
  }

  $('#set_hostname').submit(
    function(){
      var hostname = $('#hostname').val();
      $.cookie('hostname', hostname);
      if (adaptor != null){
	adaptor.close();
	delete adaptor;
      }
      adaptor = new wxconsole.Adaptor(hostname, port);
      adaptor.init();
      return false;
    });

  $('#level_buttons > .btn').click(
    function(){
      adaptor.controller.toggleSelectedLevel($(this).text());
      $(this).button('toggle');
    });
  $('#pause_button').click(
    function(){
      adaptor.controller.togglePause();
      $(this).button('toggle');
    });
  $('#clear_button').click(
    function(){
      adaptor.controller.clear();
    });
  $('#setting_button').click(
    function(){
      console.log(adaptor.getTopic());
      $('#rosout_topic_input').val(adaptor.getTopic());
      $('#buffer_size_input').val(adaptor.controller.MaxNumberOfDisplayedMessages);
      $('#port_number_input').val(adaptor.port);
      $('input[name="rosbridgeVersion"]').val([adaptor.ROSBRIDGE_VERSION]);
      $('#modal_setting').modal();
    });
  $('#setup_submit').click(
    function(){
      var topic = $('#rosout_topic_input').val();
      var bufferSize = $('#buffer_size_input').val();
      var version = $('input[name="rosbridgeVersion"]:checked').val();
      var newPortNumber = $('#port_number_input').val();

      // if version is changed, create new wx instance
      if (version != adaptor.ROSBRIDGE_VERSION ||
	  newPortNumber != port) {
	$.cookie('rosbridgeVersion', version);
	if (adaptor != null){
	  adaptor.close();
	  delete adaptor;
	}
	var hostname = $('#hostname').val();
	wxconsole.setRosbridgeVersion(version);
	port = newPortNumber;
	$.cookie('portNumber', port);
	adaptor = new wxconsole.Adaptor(hostname, port, topic, bufferSize);
	adaptor.init();
      } else {
	// set variables to current wx instance
	adaptor.setTopic(topic);
	adaptor.controller.MaxNumberOfDisplayedMessages = bufferSize;
      }
    });
};

$(function() {
    (function(){
       var app = new wxconsole.App();
     }());
  });
