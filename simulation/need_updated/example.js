var Gossiper = require('../lib/gossiper').Gossiper;
// Create a seed peer.
var seed = new Gossiper(9000, [], '127.0.0.1');
seed.start();

// Create 20 new peers and point them at the seed (usually this would happen in 20 separate processes)
// To prevent having a single point of failure you would probably have multiple seeds
for(var i = 9001; i <= 9020;i++) {
  var g = new Gossiper(i, ['127.0.0.1:9000']);
  g.start();
  
  g.on('update', function(peer, k, v) {
    if(k == 'somekey') {
      console.log("peer ", peer, " set ", k, " to ", v); // peer 127.0.0.1:9999 set somekey to somevalue
    }
  });

  sendUpdate(g);
}

// Add another peer which updates it's state after 15 seconds
var updater = new Gossiper(9999, ['127.0.0.1:9000']);
updater.start();
sendUpdate(updater);

var time = 30000;

function sendUpdate(g) {
	time = time - 100;
	setTimeout(function() {
  		g.setLocalState('somekey', {x:1, y:2});
	}, time);	
}
