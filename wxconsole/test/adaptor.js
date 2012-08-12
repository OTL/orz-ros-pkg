test('Rosbridge1Adaptor.construct', function() {
       var adaptor = new wxconsole.Rosbridge1Adaptor('host1', 9099);
       equal(adaptor.getTopic(), '/rosout_agg');
       equal(adaptor.ROSBRIDGE_VERSION, '1.0');
});

test('Rosbridge2Adaptor.construct', function() {
       var adaptor = new wxconsole.Rosbridge2Adaptor('host2', 9098);
       equal(adaptor.getTopic(), '/rosout_agg');
       equal(adaptor.ROSBRIDGE_VERSION, '2.0');
});

