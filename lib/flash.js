/**
 * Module dependencies.
 */
var format = require('util').format;
var isArray = require('util').isArray;


/**
 * Expose `flash()` function on requests.
 *
 * @return {Function}
 */
module.exports = function flash(options) {
  options = options || {};
  var safe = (options.unsafe === undefined) ? true : !options.unsafe;

  return function(req, res, next) {
    if (req.flash && safe) {
      return next();
    }

    req.flash = _flash;
    req.flashPeek = _flashPeek;
    req.normalizeFlashMessage = _normalizeFlashMessage;
    next();
  }
};

/**
 * Queue flash `msg` of the given `type`.
 *
 * Examples:
 *
 *      req.flash('info', 'email sent');
 *      req.flash('error', 'email delivery failed');
 *      req.flash('info', 'email re-sent');
 *      // => 2
 *
 *      req.flash('info');
 *      // => ['email sent', 'email re-sent']
 *
 *      req.flash('info');
 *      // => []
 *
 *      req.flash();
 *      // => { error: ['email delivery failed'], info: [] }
 *
 * Formatting:
 *
 * Flash notifications also support arbitrary formatting support.
 * For example you may pass variable arguments to `req.flash()`
 * and use the %s specifier to be replaced by the associated argument:
 *
 *     req.flash('info', 'email has been sent to %s.', userName);
 *
 * Formatting uses `util.format()`, which is available on Node 0.6+.
 *
 * @param {String} type
 * @param {String} msg
 * @return {Array|Object|Number}
 */
function _flash(type, msg) {
  if (this.session === undefined) {
    throw Error('req.flash() requires sessions');
  }

  var msgs = this.session.flash = this.session.flash || {};

  if (type && msg) {
    // util.format is available in Node.js 0.6+
    if (arguments.length > 2 && format) {
      var args = Array.prototype.slice.call(arguments, 1);
      msg = format.apply(undefined, args);
    } else if (isArray(msg)) {
      msg.forEach(function(val) {
        (msgs[type] = msgs[type] || []).push(_normalizeFlashMessage(val));
      });
      return msgs[type].length;
    }
    return (msgs[type] = msgs[type] || []).push(_normalizeFlashMessage(msg));
  } else if (type) {
    var arr = msgs[type];
    delete msgs[type];
    return arr || [];
  } else {
    this.session.flash = {};
    return msgs;
  }
}

// Returns the flash messages for the specific type WITHOUT clearing them.
function _flashPeek(type) {
  if (this.session === undefined) {
    throw Error('req.flashPeek() requires sessions');
  }

  var msgs = this.session.flash = this.session.flash || {};

  if (type) {
    var arr = msgs[type];
    return arr || [];
  } else {
    return msgs;
  }
}

function _normalizeFlashMessage(msg) {
  var alertObj;

  if (_.isString(alert)) {
    alertObj = {
      param: '',
      msg: msg,
      value: ''
    };
  } else {
    alertObj = msg;
  }

  return alertObj;
}
