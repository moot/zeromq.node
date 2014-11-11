var zmq = require('../');
var assert = require('assert');

if (process.argv.length != 5) {
  console.log('usage: local_thr <bind-to> <message-size> <message-count>');
  process.exit(1);
}

var bind_to = process.argv[2];
var message_size = Number(process.argv[3]);
var message_count = Number(process.argv[4]);
var counter = 0;

var sock = zmq.socket('router');
sock.bindSync(bind_to);

sock.on('message', function () {
  if( !counter )
    console.log('started receiving');

  ++counter; 
  //assert.equal(data.length, message_size, 'message-size did not match');
  sock.send([arguments[0], arguments[1].toString()]);
})
