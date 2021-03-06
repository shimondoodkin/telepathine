var Gossiper = require('../lib/gossiper').Gossiper,
    PeerState = require('../lib/peer_state').PeerState;

module.exports = {
  'should be able to set and retrieve local state' : function(beforeExit, assert) {
    var g = new Gossiper(1234);
    g.setLocalState('hi', 'hello');
    assert.equal('hello', g.getLocalState('hi'));
  },
  'should be able to get a list of keys for a peer' : function(beforeExit, assert) {
    var g = new Gossiper(1234);
    g.peers['p1'] = new PeerState(12345);
    g.peers['p1'].attrs['keyz'] = [];
    g.peers['p1'].attrs['keyzy'] = [];
    assert.deepEqual(['keyz','keyzy'], g.peerKeys('p1'));
  },
  'should be able to get the value of a key for a peer' : function(beforeExit, assert) {
    var g = new Gossiper(1234);
    g.peers['p1'] = new PeerState(12345);
    g.peers['p1'].attrs['keyz'] = ['hi', 1];
    assert.equal('hi', g.peerValue('p1','keyz'));
  },
  'should be able to get a list of peers' : function(beforeExit, assert) {
    var g = new Gossiper(1234);
    g.peers['p1'] = new PeerState(12345);
    g.peers['p2'] = new PeerState(12345);
    assert.deepEqual(['p1','p2'], g.allPeers());
  },
  'should emit new_peer event when we learn about a new peer' : function(beforeExit, assert) {

    var g = new Gossiper(1234);
    // mock scuttle
    g.scuttle = { 'scuttle' : function(v) {
      return { 'new_peers' : ['[::1]:8010'] };
    }} ;

    var emitted = false;
    g.on('new_peer', function() {
      emitted = true;
    });
    g.firstResponseMessage({});
    beforeExit(function() {
      assert.ok(emitted);
    });
  },
  'should emit update event when we learn more about a peer' : function(beforeExit, assert) {
    var g = new Gossiper(1234);
    g.peers['[::1]:9010'] = new PeerState(9010);
    g.handleNewPeers({ '[::1]:9010': undefined });
    var update = null;
    g.on('update', function(peer,k,v) {
     update = [peer,k,v];
    });
    g.peers['[::1]:9010'].updateLocal('howdy', 'yall');
    beforeExit(function() {
      assert.deepEqual(['[::1]:9010', 'howdy', 'yall'], update);
    });
  }
  ,'Bind to local ipv6 address': function(beforeExit, assert) {
    var g = new Gossiper(9018, [], '::1');
    g.start();
    setTimeout(function() {
      var boundAddress = g.server.address().address;
      g.stop();
      beforeExit(function() {
        assert.deepEqual(boundAddress, '::1');
      });
    }, 2000);
  }
}
