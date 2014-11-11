var zmq = require('../')
var assert = require('assert')

if (process.argv.length != 5) {
  console.log('usage: remote_thr <bind-to> <message-size> <message-count>')
  process.exit(1)
}

var connect_to = process.argv[2]
var message_size = Number(process.argv[3])
var message_count = Number(process.argv[4])
var message = new Buffer(message_size)
message.fill('h')

var counter = 0
var tuner;

var sock = zmq.socket('dealer')
sock.on('message', function(msg){
  //console.log(msg, counter, message_count);
  if (++counter === message_count) finish();
});
//sock.setsockopt(zmq.ZMQ_SNDHWM, message_count);
sock.connect(connect_to)

function send(){
timer = process.hrtime();
  for (var i = 0; i < message_count; i++) {
    sock.send([message])
  }

  // all messages may not be received by local_thr if closed immediately
  //setTimeout(function () {
  //  sock.close()
  //}, 1000);
}

// because of what seems to be a bug in node-zmq, we would lose messages
// if we start sending immediately after calling connect(), so to make this
// benchmark behave well, we wait a bit...

setTimeout(send, 1000);

function finish(){
  var endtime = process.hrtime(timer);
  var sec = endtime[0] + (endtime[1]/1000000000);
  var throughput = message_count / sec;
  var megabits = (throughput * message_size * 8) / 1000000;

  console.log('message size: %d [B]', message_size);
  console.log('message count: %d', message_count);
  console.log('mean throughput: %d [msg/s]', throughput.toFixed(0));
  console.log('mean throughput: %d [Mbit/s]', megabits.toFixed(0));
  console.log('overall time: %d secs and %d nanoseconds', endtime[0], endtime[1]);
  sock.close();
}

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  sock.close();
  setTimeout(function () {
    process.exit();
  }, 1000);
});
