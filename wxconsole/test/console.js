test('Console', function() {
       var controller = new wxconsole.Console('localhost', 9090);
       equal(controller.MaxNumberOfDisplayedMessages, 500);
       equal(controller.titleString, 'wxconsole');
       equal(controller.isPaused, false);
     });

test('Console', function() {
       var controller = new wxconsole.Console('localhost', 9090);
       equal(controller.MaxNumberOfDisplayedMessages, 500);
       equal(controller.titleString, 'wxconsole');
       equal(controller.isPaused, false);
       equal(controller.tableId, 'rosout_table');
       equal(controller.getUri(), 'ws://localhost:9090');
       equal(controller.messageId, 'message');
     });

test('Console.togglePause', function() {
       var controller = new wxconsole.Console('localhost', 9090);
       equal(controller.isPaused, false);
       controller.togglePause();
       equal(controller.isPaused, true);
       controller.togglePause();
       equal(controller.isPaused, false);
     });

