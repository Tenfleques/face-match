// const EventEmitter = require('events');

const Stream = function() {
    var self = this;
  
    // object literal of connections; IP addresses + target view as the key
    self.connections = {};
    self.closed_connections = [];
  
    self.enable = function() {
      return function(req, res, next) {
        res.sseSetup = function() {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          })
        }
  
        res.sseSend = function(id, event, data) {
          var stream = "id: " + String(id) + "\n" +
          "event: " + String(event) + "\n" +
          "data: " + JSON.stringify(data) +
          "\n\n";

          res.write(stream);
        }  
        next()
      }
    }

    self.remove = (id) => {
      self.connections[id].status(404).end();
      self.closed_connections.push(id);
    }
  
    self.add = function(id, response) {
            response.sseSetup();
      self.connections[id] = response;
           
    }.bind(self);

    self.update = (ip_key, id, type, data) => {
      if(self.connections[ip_key]){
        self.connections[key].sseSend(id, type, data);
      }else{
        self.push_sse(id, type, data);
      }
    }
  
    self.push_sse = function(id, type, obj) {
      let coun = 0;
      Object
      .keys(self.connections)
      .forEach(function(key){
        coun++;
        self.connections[key].sseSend(id, type, obj);
      });
    }.bind(self);
  
}
  
module.exports = Stream;