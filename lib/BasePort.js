(function() {
  var BasePort, EventEmitter, validTypes,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  validTypes = ['all', 'string', 'number', 'int', 'object', 'array', 'boolean', 'color', 'date', 'bang', 'function', 'buffer', 'stream'];

  BasePort = (function(superClass) {
    extend(BasePort, superClass);

    function BasePort(options) {
      this.handleOptions(options);
      this.sockets = [];
      this.node = null;
      this.name = null;
    }

    BasePort.prototype.handleOptions = function(options) {
      if (!options) {
        options = {};
      }
      if (!options.datatype) {
        options.datatype = 'all';
      }
      if (options.required === void 0) {
        options.required = false;
      }
      if (options.datatype === 'integer') {
        options.datatype = 'int';
      }
      if (validTypes.indexOf(options.datatype) === -1) {
        throw new Error("Invalid port datatype '" + options.datatype + "' specified, valid are " + (validTypes.join(', ')));
      }
      if (options.type && options.type.indexOf('/') === -1) {
        throw new Error("Invalid port type '" + options.type + "' specified. Should be URL or MIME type");
      }
      return this.options = options;
    };

    BasePort.prototype.getId = function() {
      if (!(this.node && this.name)) {
        return 'Port';
      }
      return this.node + " " + (this.name.toUpperCase());
    };

    BasePort.prototype.getDataType = function() {
      return this.options.datatype;
    };

    BasePort.prototype.getDescription = function() {
      return this.options.description;
    };

    BasePort.prototype.attach = function(socket, index) {
      if (index == null) {
        index = null;
      }
      if (!this.isAddressable() || index === null) {
        index = this.sockets.length;
      }
      this.sockets[index] = socket;
      this.attachSocket(socket, index);
      if (this.isAddressable()) {
        this.emit('attach', socket, index);
        return;
      }
      return this.emit('attach', socket);
    };

    BasePort.prototype.attachSocket = function() {};

    BasePort.prototype.detach = function(socket) {
      var index;
      index = this.sockets.indexOf(socket);
      if (index === -1) {
        return;
      }
      this.sockets[index] = void 0;
      if (this.isAddressable()) {
        this.emit('detach', socket, index);
        return;
      }
      return this.emit('detach', socket);
    };

    BasePort.prototype.isAddressable = function() {
      if (this.options.addressable) {
        return true;
      }
      return false;
    };

    BasePort.prototype.isBuffered = function() {
      if (this.options.buffered) {
        return true;
      }
      return false;
    };

    BasePort.prototype.isRequired = function() {
      if (this.options.required) {
        return true;
      }
      return false;
    };

    BasePort.prototype.isAttached = function(socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (this.isAddressable() && socketId !== null) {
        if (this.sockets[socketId]) {
          return true;
        }
        return false;
      }
      if (this.sockets.length) {
        return true;
      }
      return false;
    };

    BasePort.prototype.listAttached = function() {
      var attached, i, idx, len, ref, socket;
      attached = [];
      ref = this.sockets;
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        socket = ref[idx];
        if (!socket) {
          continue;
        }
        attached.push(idx);
      }
      return attached;
    };

    BasePort.prototype.isConnected = function(socketId) {
      var connected;
      if (socketId == null) {
        socketId = null;
      }
      if (this.isAddressable()) {
        if (socketId === null) {
          throw new Error((this.getId()) + ": Socket ID required");
        }
        if (!this.sockets[socketId]) {
          throw new Error((this.getId()) + ": Socket " + socketId + " not available");
        }
        return this.sockets[socketId].isConnected();
      }
      connected = false;
      this.sockets.forEach((function(_this) {
        return function(socket) {
          if (!socket) {
            return;
          }
          if (socket.isConnected()) {
            return connected = true;
          }
        };
      })(this));
      return connected;
    };

    BasePort.prototype.canAttach = function() {
      return true;
    };

    return BasePort;

  })(EventEmitter);

  module.exports = BasePort;

}).call(this);
