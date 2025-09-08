import require$$0$5 from "body-parser";
import require$$1$3 from "events";
import require$$2$6 from "merge-descriptors";
import require$$0$3 from "finalhandler";
import require$$0 from "debug";
import require$$1 from "array-flatten";
import require$$0$1 from "path-to-regexp";
import require$$2 from "methods";
import require$$11 from "utils-merge";
import require$$3 from "depd";
import require$$7 from "parseurl";
import require$$8 from "setprototypeof";
import require$$2$1 from "qs";
import require$$1$1, { dirname, join } from "path";
import require$$2$2, { readFileSync } from "fs";
import require$$7$2 from "http";
import require$$0$2 from "safe-buffer";
import require$$1$2 from "content-disposition";
import require$$2$3 from "content-type";
import require$$5 from "send";
import require$$6 from "etag";
import require$$7$1 from "proxy-addr";
import require$$9 from "querystring";
import require$$0$4 from "accepts";
import require$$2$4 from "net";
import require$$3$1 from "type-is";
import require$$5$1 from "fresh";
import require$$6$1 from "range-parser";
import require$$2$5 from "http-errors";
import require$$4 from "encodeurl";
import require$$5$2 from "escape-html";
import require$$8$1 from "on-finished";
import require$$10 from "statuses";
import require$$12 from "cookie-signature";
import require$$13 from "cookie";
import require$$15 from "vary";
import require$$9$1 from "serve-static";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v2 } from "cloudinary";
import Razorpay from "razorpay";
import crypto from "crypto";
import { fileURLToPath } from "url";
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var express$2 = { exports: {} };
var application = { exports: {} };
var router$6 = { exports: {} };
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var layer;
var hasRequiredLayer;
function requireLayer() {
  if (hasRequiredLayer) return layer;
  hasRequiredLayer = 1;
  var pathRegexp = require$$0$1;
  var debug = require$$0("express:router:layer");
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  layer = Layer;
  function Layer(path, options, fn) {
    if (!(this instanceof Layer)) {
      return new Layer(path, options, fn);
    }
    debug("new %o", path);
    var opts = options || {};
    this.handle = fn;
    this.name = fn.name || "<anonymous>";
    this.params = void 0;
    this.path = void 0;
    this.regexp = pathRegexp(path, this.keys = [], opts);
    this.regexp.fast_star = path === "*";
    this.regexp.fast_slash = path === "/" && opts.end === false;
  }
  Layer.prototype.handle_error = function handle_error(error, req, res, next) {
    var fn = this.handle;
    if (fn.length !== 4) {
      return next(error);
    }
    try {
      fn(error, req, res, next);
    } catch (err) {
      next(err);
    }
  };
  Layer.prototype.handle_request = function handle(req, res, next) {
    var fn = this.handle;
    if (fn.length > 3) {
      return next();
    }
    try {
      fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
  Layer.prototype.match = function match(path) {
    var match2;
    if (path != null) {
      if (this.regexp.fast_slash) {
        this.params = {};
        this.path = "";
        return true;
      }
      if (this.regexp.fast_star) {
        this.params = { "0": decode_param(path) };
        this.path = path;
        return true;
      }
      match2 = this.regexp.exec(path);
    }
    if (!match2) {
      this.params = void 0;
      this.path = void 0;
      return false;
    }
    this.params = {};
    this.path = match2[0];
    var keys = this.keys;
    var params = this.params;
    for (var i = 1; i < match2.length; i++) {
      var key = keys[i - 1];
      var prop = key.name;
      var val = decode_param(match2[i]);
      if (val !== void 0 || !hasOwnProperty.call(params, prop)) {
        params[prop] = val;
      }
    }
    return true;
  };
  function decode_param(val) {
    if (typeof val !== "string" || val.length === 0) {
      return val;
    }
    try {
      return decodeURIComponent(val);
    } catch (err) {
      if (err instanceof URIError) {
        err.message = "Failed to decode param '" + val + "'";
        err.status = err.statusCode = 400;
      }
      throw err;
    }
  }
  return layer;
}
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var route;
var hasRequiredRoute;
function requireRoute() {
  if (hasRequiredRoute) return route;
  hasRequiredRoute = 1;
  var debug = require$$0("express:router:route");
  var flatten = require$$1;
  var Layer = requireLayer();
  var methods = require$$2;
  var slice = Array.prototype.slice;
  var toString = Object.prototype.toString;
  route = Route;
  function Route(path) {
    this.path = path;
    this.stack = [];
    debug("new %o", path);
    this.methods = {};
  }
  Route.prototype._handles_method = function _handles_method(method) {
    if (this.methods._all) {
      return true;
    }
    var name = typeof method === "string" ? method.toLowerCase() : method;
    if (name === "head" && !this.methods["head"]) {
      name = "get";
    }
    return Boolean(this.methods[name]);
  };
  Route.prototype._options = function _options() {
    var methods2 = Object.keys(this.methods);
    if (this.methods.get && !this.methods.head) {
      methods2.push("head");
    }
    for (var i = 0; i < methods2.length; i++) {
      methods2[i] = methods2[i].toUpperCase();
    }
    return methods2;
  };
  Route.prototype.dispatch = function dispatch(req, res, done) {
    var idx = 0;
    var stack = this.stack;
    var sync = 0;
    if (stack.length === 0) {
      return done();
    }
    var method = typeof req.method === "string" ? req.method.toLowerCase() : req.method;
    if (method === "head" && !this.methods["head"]) {
      method = "get";
    }
    req.route = this;
    next();
    function next(err) {
      if (err && err === "route") {
        return done();
      }
      if (err && err === "router") {
        return done(err);
      }
      if (++sync > 100) {
        return setImmediate(next, err);
      }
      var layer2 = stack[idx++];
      if (!layer2) {
        return done(err);
      }
      if (layer2.method && layer2.method !== method) {
        next(err);
      } else if (err) {
        layer2.handle_error(err, req, res, next);
      } else {
        layer2.handle_request(req, res, next);
      }
      sync = 0;
    }
  };
  Route.prototype.all = function all() {
    var handles = flatten(slice.call(arguments));
    for (var i = 0; i < handles.length; i++) {
      var handle = handles[i];
      if (typeof handle !== "function") {
        var type = toString.call(handle);
        var msg = "Route.all() requires a callback function but got a " + type;
        throw new TypeError(msg);
      }
      var layer2 = Layer("/", {}, handle);
      layer2.method = void 0;
      this.methods._all = true;
      this.stack.push(layer2);
    }
    return this;
  };
  methods.forEach(function(method) {
    Route.prototype[method] = function() {
      var handles = flatten(slice.call(arguments));
      for (var i = 0; i < handles.length; i++) {
        var handle = handles[i];
        if (typeof handle !== "function") {
          var type = toString.call(handle);
          var msg = "Route." + method + "() requires a callback function but got a " + type;
          throw new Error(msg);
        }
        debug("%s %o", method, this.path);
        var layer2 = Layer("/", {}, handle);
        layer2.method = method;
        this.methods[method] = true;
        this.stack.push(layer2);
      }
      return this;
    };
  });
  return route;
}
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var hasRequiredRouter;
function requireRouter() {
  if (hasRequiredRouter) return router$6.exports;
  hasRequiredRouter = 1;
  var Route = requireRoute();
  var Layer = requireLayer();
  var methods = require$$2;
  var mixin = require$$11;
  var debug = require$$0("express:router");
  var deprecate = require$$3("express");
  var flatten = require$$1;
  var parseUrl = require$$7;
  var setPrototypeOf = require$$8;
  var objectRegExp = /^\[object (\S+)\]$/;
  var slice = Array.prototype.slice;
  var toString = Object.prototype.toString;
  var proto = router$6.exports = function(options) {
    var opts = options || {};
    function router2(req, res, next) {
      router2.handle(req, res, next);
    }
    setPrototypeOf(router2, proto);
    router2.params = {};
    router2._params = [];
    router2.caseSensitive = opts.caseSensitive;
    router2.mergeParams = opts.mergeParams;
    router2.strict = opts.strict;
    router2.stack = [];
    return router2;
  };
  proto.param = function param(name, fn) {
    if (typeof name === "function") {
      deprecate("router.param(fn): Refactor to use path params");
      this._params.push(name);
      return;
    }
    var params = this._params;
    var len = params.length;
    var ret;
    if (name[0] === ":") {
      deprecate("router.param(" + JSON.stringify(name) + ", fn): Use router.param(" + JSON.stringify(name.slice(1)) + ", fn) instead");
      name = name.slice(1);
    }
    for (var i = 0; i < len; ++i) {
      if (ret = params[i](name, fn)) {
        fn = ret;
      }
    }
    if ("function" !== typeof fn) {
      throw new Error("invalid param() call for " + name + ", got " + fn);
    }
    (this.params[name] = this.params[name] || []).push(fn);
    return this;
  };
  proto.handle = function handle(req, res, out) {
    var self = this;
    debug("dispatching %s %s", req.method, req.url);
    var idx = 0;
    var protohost = getProtohost(req.url) || "";
    var removed = "";
    var slashAdded = false;
    var sync = 0;
    var paramcalled = {};
    var options = [];
    var stack = self.stack;
    var parentParams = req.params;
    var parentUrl = req.baseUrl || "";
    var done = restore(out, req, "baseUrl", "next", "params");
    req.next = next;
    if (req.method === "OPTIONS") {
      done = wrap(done, function(old, err) {
        if (err || options.length === 0) return old(err);
        sendOptionsResponse(res, options, old);
      });
    }
    req.baseUrl = parentUrl;
    req.originalUrl = req.originalUrl || req.url;
    next();
    function next(err) {
      var layerError = err === "route" ? null : err;
      if (slashAdded) {
        req.url = req.url.slice(1);
        slashAdded = false;
      }
      if (removed.length !== 0) {
        req.baseUrl = parentUrl;
        req.url = protohost + removed + req.url.slice(protohost.length);
        removed = "";
      }
      if (layerError === "router") {
        setImmediate(done, null);
        return;
      }
      if (idx >= stack.length) {
        setImmediate(done, layerError);
        return;
      }
      if (++sync > 100) {
        return setImmediate(next, err);
      }
      var path = getPathname(req);
      if (path == null) {
        return done(layerError);
      }
      var layer2;
      var match;
      var route2;
      while (match !== true && idx < stack.length) {
        layer2 = stack[idx++];
        match = matchLayer(layer2, path);
        route2 = layer2.route;
        if (typeof match !== "boolean") {
          layerError = layerError || match;
        }
        if (match !== true) {
          continue;
        }
        if (!route2) {
          continue;
        }
        if (layerError) {
          match = false;
          continue;
        }
        var method = req.method;
        var has_method = route2._handles_method(method);
        if (!has_method && method === "OPTIONS") {
          appendMethods(options, route2._options());
        }
        if (!has_method && method !== "HEAD") {
          match = false;
        }
      }
      if (match !== true) {
        return done(layerError);
      }
      if (route2) {
        req.route = route2;
      }
      req.params = self.mergeParams ? mergeParams(layer2.params, parentParams) : layer2.params;
      var layerPath = layer2.path;
      self.process_params(layer2, paramcalled, req, res, function(err2) {
        if (err2) {
          next(layerError || err2);
        } else if (route2) {
          layer2.handle_request(req, res, next);
        } else {
          trim_prefix(layer2, layerError, layerPath, path);
        }
        sync = 0;
      });
    }
    function trim_prefix(layer2, layerError, layerPath, path) {
      if (layerPath.length !== 0) {
        if (layerPath !== path.slice(0, layerPath.length)) {
          next(layerError);
          return;
        }
        var c = path[layerPath.length];
        if (c && c !== "/" && c !== ".") return next(layerError);
        debug("trim prefix (%s) from url %s", layerPath, req.url);
        removed = layerPath;
        req.url = protohost + req.url.slice(protohost.length + removed.length);
        if (!protohost && req.url[0] !== "/") {
          req.url = "/" + req.url;
          slashAdded = true;
        }
        req.baseUrl = parentUrl + (removed[removed.length - 1] === "/" ? removed.substring(0, removed.length - 1) : removed);
      }
      debug("%s %s : %s", layer2.name, layerPath, req.originalUrl);
      if (layerError) {
        layer2.handle_error(layerError, req, res, next);
      } else {
        layer2.handle_request(req, res, next);
      }
    }
  };
  proto.process_params = function process_params(layer2, called, req, res, done) {
    var params = this.params;
    var keys = layer2.keys;
    if (!keys || keys.length === 0) {
      return done();
    }
    var i = 0;
    var name;
    var paramIndex = 0;
    var key;
    var paramVal;
    var paramCallbacks;
    var paramCalled;
    function param(err) {
      if (err) {
        return done(err);
      }
      if (i >= keys.length) {
        return done();
      }
      paramIndex = 0;
      key = keys[i++];
      name = key.name;
      paramVal = req.params[name];
      paramCallbacks = params[name];
      paramCalled = called[name];
      if (paramVal === void 0 || !paramCallbacks) {
        return param();
      }
      if (paramCalled && (paramCalled.match === paramVal || paramCalled.error && paramCalled.error !== "route")) {
        req.params[name] = paramCalled.value;
        return param(paramCalled.error);
      }
      called[name] = paramCalled = {
        error: null,
        match: paramVal,
        value: paramVal
      };
      paramCallback();
    }
    function paramCallback(err) {
      var fn = paramCallbacks[paramIndex++];
      paramCalled.value = req.params[key.name];
      if (err) {
        paramCalled.error = err;
        param(err);
        return;
      }
      if (!fn) return param();
      try {
        fn(req, res, paramCallback, paramVal, key.name);
      } catch (e) {
        paramCallback(e);
      }
    }
    param();
  };
  proto.use = function use(fn) {
    var offset = 0;
    var path = "/";
    if (typeof fn !== "function") {
      var arg = fn;
      while (Array.isArray(arg) && arg.length !== 0) {
        arg = arg[0];
      }
      if (typeof arg !== "function") {
        offset = 1;
        path = fn;
      }
    }
    var callbacks = flatten(slice.call(arguments, offset));
    if (callbacks.length === 0) {
      throw new TypeError("Router.use() requires a middleware function");
    }
    for (var i = 0; i < callbacks.length; i++) {
      var fn = callbacks[i];
      if (typeof fn !== "function") {
        throw new TypeError("Router.use() requires a middleware function but got a " + gettype(fn));
      }
      debug("use %o %s", path, fn.name || "<anonymous>");
      var layer2 = new Layer(path, {
        sensitive: this.caseSensitive,
        strict: false,
        end: false
      }, fn);
      layer2.route = void 0;
      this.stack.push(layer2);
    }
    return this;
  };
  proto.route = function route2(path) {
    var route3 = new Route(path);
    var layer2 = new Layer(path, {
      sensitive: this.caseSensitive,
      strict: this.strict,
      end: true
    }, route3.dispatch.bind(route3));
    layer2.route = route3;
    this.stack.push(layer2);
    return route3;
  };
  methods.concat("all").forEach(function(method) {
    proto[method] = function(path) {
      var route2 = this.route(path);
      route2[method].apply(route2, slice.call(arguments, 1));
      return this;
    };
  });
  function appendMethods(list, addition) {
    for (var i = 0; i < addition.length; i++) {
      var method = addition[i];
      if (list.indexOf(method) === -1) {
        list.push(method);
      }
    }
  }
  function getPathname(req) {
    try {
      return parseUrl(req).pathname;
    } catch (err) {
      return void 0;
    }
  }
  function getProtohost(url) {
    if (typeof url !== "string" || url.length === 0 || url[0] === "/") {
      return void 0;
    }
    var searchIndex = url.indexOf("?");
    var pathLength = searchIndex !== -1 ? searchIndex : url.length;
    var fqdnIndex = url.slice(0, pathLength).indexOf("://");
    return fqdnIndex !== -1 ? url.substring(0, url.indexOf("/", 3 + fqdnIndex)) : void 0;
  }
  function gettype(obj) {
    var type = typeof obj;
    if (type !== "object") {
      return type;
    }
    return toString.call(obj).replace(objectRegExp, "$1");
  }
  function matchLayer(layer2, path) {
    try {
      return layer2.match(path);
    } catch (err) {
      return err;
    }
  }
  function mergeParams(params, parent) {
    if (typeof parent !== "object" || !parent) {
      return params;
    }
    var obj = mixin({}, parent);
    if (!(0 in params) || !(0 in parent)) {
      return mixin(obj, params);
    }
    var i = 0;
    var o = 0;
    while (i in params) {
      i++;
    }
    while (o in parent) {
      o++;
    }
    for (i--; i >= 0; i--) {
      params[i + o] = params[i];
      if (i < o) {
        delete params[i];
      }
    }
    return mixin(obj, params);
  }
  function restore(fn, obj) {
    var props = new Array(arguments.length - 2);
    var vals = new Array(arguments.length - 2);
    for (var i = 0; i < props.length; i++) {
      props[i] = arguments[i + 2];
      vals[i] = obj[props[i]];
    }
    return function() {
      for (var i2 = 0; i2 < props.length; i2++) {
        obj[props[i2]] = vals[i2];
      }
      return fn.apply(this, arguments);
    };
  }
  function sendOptionsResponse(res, options, next) {
    try {
      var body = options.join(",");
      res.set("Allow", body);
      res.send(body);
    } catch (err) {
      next(err);
    }
  }
  function wrap(old, fn) {
    return function proxy() {
      var args = new Array(arguments.length + 1);
      args[0] = old;
      for (var i = 0, len = arguments.length; i < len; i++) {
        args[i + 1] = arguments[i];
      }
      fn.apply(this, args);
    };
  }
  return router$6.exports;
}
var init = {};
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var hasRequiredInit;
function requireInit() {
  if (hasRequiredInit) return init;
  hasRequiredInit = 1;
  var setPrototypeOf = require$$8;
  init.init = function(app2) {
    return function expressInit(req, res, next) {
      if (app2.enabled("x-powered-by")) res.setHeader("X-Powered-By", "Express");
      req.res = res;
      res.req = req;
      req.next = next;
      setPrototypeOf(req, app2.request);
      setPrototypeOf(res, app2.response);
      res.locals = res.locals || /* @__PURE__ */ Object.create(null);
      next();
    };
  };
  return init;
}
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var query;
var hasRequiredQuery;
function requireQuery() {
  if (hasRequiredQuery) return query;
  hasRequiredQuery = 1;
  var merge = require$$11;
  var parseUrl = require$$7;
  var qs = require$$2$1;
  query = function query2(options) {
    var opts = merge({}, options);
    var queryparse = qs.parse;
    if (typeof options === "function") {
      queryparse = options;
      opts = void 0;
    }
    if (opts !== void 0 && opts.allowPrototypes === void 0) {
      opts.allowPrototypes = true;
    }
    return function query3(req, res, next) {
      if (!req.query) {
        var val = parseUrl(req).query;
        req.query = queryparse(val, opts);
      }
      next();
    };
  };
  return query;
}
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var view;
var hasRequiredView;
function requireView() {
  if (hasRequiredView) return view;
  hasRequiredView = 1;
  var debug = require$$0("express:view");
  var path = require$$1$1;
  var fs = require$$2$2;
  var dirname2 = path.dirname;
  var basename = path.basename;
  var extname = path.extname;
  var join2 = path.join;
  var resolve = path.resolve;
  view = View;
  function View(name, options) {
    var opts = options || {};
    this.defaultEngine = opts.defaultEngine;
    this.ext = extname(name);
    this.name = name;
    this.root = opts.root;
    if (!this.ext && !this.defaultEngine) {
      throw new Error("No default engine was specified and no extension was provided.");
    }
    var fileName = name;
    if (!this.ext) {
      this.ext = this.defaultEngine[0] !== "." ? "." + this.defaultEngine : this.defaultEngine;
      fileName += this.ext;
    }
    if (!opts.engines[this.ext]) {
      var mod = this.ext.slice(1);
      debug('require "%s"', mod);
      var fn = commonjsRequire(mod).__express;
      if (typeof fn !== "function") {
        throw new Error('Module "' + mod + '" does not provide a view engine.');
      }
      opts.engines[this.ext] = fn;
    }
    this.engine = opts.engines[this.ext];
    this.path = this.lookup(fileName);
  }
  View.prototype.lookup = function lookup(name) {
    var path2;
    var roots = [].concat(this.root);
    debug('lookup "%s"', name);
    for (var i = 0; i < roots.length && !path2; i++) {
      var root = roots[i];
      var loc = resolve(root, name);
      var dir = dirname2(loc);
      var file = basename(loc);
      path2 = this.resolve(dir, file);
    }
    return path2;
  };
  View.prototype.render = function render(options, callback) {
    debug('render "%s"', this.path);
    this.engine(this.path, options, callback);
  };
  View.prototype.resolve = function resolve2(dir, file) {
    var ext = this.ext;
    var path2 = join2(dir, file);
    var stat = tryStat(path2);
    if (stat && stat.isFile()) {
      return path2;
    }
    path2 = join2(dir, basename(file, ext), "index" + ext);
    stat = tryStat(path2);
    if (stat && stat.isFile()) {
      return path2;
    }
  };
  function tryStat(path2) {
    debug('stat "%s"', path2);
    try {
      return fs.statSync(path2);
    } catch (e) {
      return void 0;
    }
  }
  return view;
}
var utils = {};
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  (function(exports) {
    var Buffer = require$$0$2.Buffer;
    var contentDisposition = require$$1$2;
    var contentType = require$$2$3;
    var deprecate = require$$3("express");
    var flatten = require$$1;
    var mime = require$$5.mime;
    var etag = require$$6;
    var proxyaddr = require$$7$1;
    var qs = require$$2$1;
    var querystring = require$$9;
    exports.etag = createETagGenerator({ weak: false });
    exports.wetag = createETagGenerator({ weak: true });
    exports.isAbsolute = function(path) {
      if ("/" === path[0]) return true;
      if (":" === path[1] && ("\\" === path[2] || "/" === path[2])) return true;
      if ("\\\\" === path.substring(0, 2)) return true;
    };
    exports.flatten = deprecate.function(
      flatten,
      "utils.flatten: use array-flatten npm module instead"
    );
    exports.normalizeType = function(type) {
      return ~type.indexOf("/") ? acceptParams(type) : { value: mime.lookup(type), params: {} };
    };
    exports.normalizeTypes = function(types) {
      var ret = [];
      for (var i = 0; i < types.length; ++i) {
        ret.push(exports.normalizeType(types[i]));
      }
      return ret;
    };
    exports.contentDisposition = deprecate.function(
      contentDisposition,
      "utils.contentDisposition: use content-disposition npm module instead"
    );
    function acceptParams(str) {
      var parts = str.split(/ *; */);
      var ret = { value: parts[0], quality: 1, params: {} };
      for (var i = 1; i < parts.length; ++i) {
        var pms = parts[i].split(/ *= */);
        if ("q" === pms[0]) {
          ret.quality = parseFloat(pms[1]);
        } else {
          ret.params[pms[0]] = pms[1];
        }
      }
      return ret;
    }
    exports.compileETag = function(val) {
      var fn;
      if (typeof val === "function") {
        return val;
      }
      switch (val) {
        case true:
        case "weak":
          fn = exports.wetag;
          break;
        case false:
          break;
        case "strong":
          fn = exports.etag;
          break;
        default:
          throw new TypeError("unknown value for etag function: " + val);
      }
      return fn;
    };
    exports.compileQueryParser = function compileQueryParser(val) {
      var fn;
      if (typeof val === "function") {
        return val;
      }
      switch (val) {
        case true:
        case "simple":
          fn = querystring.parse;
          break;
        case false:
          fn = newObject;
          break;
        case "extended":
          fn = parseExtendedQueryString;
          break;
        default:
          throw new TypeError("unknown value for query parser function: " + val);
      }
      return fn;
    };
    exports.compileTrust = function(val) {
      if (typeof val === "function") return val;
      if (val === true) {
        return function() {
          return true;
        };
      }
      if (typeof val === "number") {
        return function(a, i) {
          return i < val;
        };
      }
      if (typeof val === "string") {
        val = val.split(",").map(function(v) {
          return v.trim();
        });
      }
      return proxyaddr.compile(val || []);
    };
    exports.setCharset = function setCharset(type, charset) {
      if (!type || !charset) {
        return type;
      }
      var parsed = contentType.parse(type);
      parsed.parameters.charset = charset;
      return contentType.format(parsed);
    };
    function createETagGenerator(options) {
      return function generateETag(body, encoding) {
        var buf = !Buffer.isBuffer(body) ? Buffer.from(body, encoding) : body;
        return etag(buf, options);
      };
    }
    function parseExtendedQueryString(str) {
      return qs.parse(str, {
        allowPrototypes: true
      });
    }
    function newObject() {
      return {};
    }
  })(utils);
  return utils;
}
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var hasRequiredApplication;
function requireApplication() {
  if (hasRequiredApplication) return application.exports;
  hasRequiredApplication = 1;
  (function(module, exports) {
    var finalhandler = require$$0$3;
    var Router = requireRouter();
    var methods = require$$2;
    var middleware = requireInit();
    var query2 = requireQuery();
    var debug = require$$0("express:application");
    var View = requireView();
    var http = require$$7$2;
    var compileETag = requireUtils().compileETag;
    var compileQueryParser = requireUtils().compileQueryParser;
    var compileTrust = requireUtils().compileTrust;
    var deprecate = require$$3("express");
    var flatten = require$$1;
    var merge = require$$11;
    var resolve = require$$1$1.resolve;
    var setPrototypeOf = require$$8;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var slice = Array.prototype.slice;
    var app2 = module.exports = {};
    var trustProxyDefaultSymbol = "@@symbol:trust_proxy_default";
    app2.init = function init2() {
      this.cache = {};
      this.engines = {};
      this.settings = {};
      this.defaultConfiguration();
    };
    app2.defaultConfiguration = function defaultConfiguration() {
      var env = process.env.NODE_ENV || "development";
      this.enable("x-powered-by");
      this.set("etag", "weak");
      this.set("env", env);
      this.set("query parser", "extended");
      this.set("subdomain offset", 2);
      this.set("trust proxy", false);
      Object.defineProperty(this.settings, trustProxyDefaultSymbol, {
        configurable: true,
        value: true
      });
      debug("booting in %s mode", env);
      this.on("mount", function onmount(parent) {
        if (this.settings[trustProxyDefaultSymbol] === true && typeof parent.settings["trust proxy fn"] === "function") {
          delete this.settings["trust proxy"];
          delete this.settings["trust proxy fn"];
        }
        setPrototypeOf(this.request, parent.request);
        setPrototypeOf(this.response, parent.response);
        setPrototypeOf(this.engines, parent.engines);
        setPrototypeOf(this.settings, parent.settings);
      });
      this.locals = /* @__PURE__ */ Object.create(null);
      this.mountpath = "/";
      this.locals.settings = this.settings;
      this.set("view", View);
      this.set("views", resolve("views"));
      this.set("jsonp callback name", "callback");
      if (env === "production") {
        this.enable("view cache");
      }
      Object.defineProperty(this, "router", {
        get: function() {
          throw new Error("'app.router' is deprecated!\nPlease see the 3.x to 4.x migration guide for details on how to update your app.");
        }
      });
    };
    app2.lazyrouter = function lazyrouter() {
      if (!this._router) {
        this._router = new Router({
          caseSensitive: this.enabled("case sensitive routing"),
          strict: this.enabled("strict routing")
        });
        this._router.use(query2(this.get("query parser fn")));
        this._router.use(middleware.init(this));
      }
    };
    app2.handle = function handle(req, res, callback) {
      var router2 = this._router;
      var done = callback || finalhandler(req, res, {
        env: this.get("env"),
        onerror: logerror.bind(this)
      });
      if (!router2) {
        debug("no routes defined on app");
        done();
        return;
      }
      router2.handle(req, res, done);
    };
    app2.use = function use(fn) {
      var offset = 0;
      var path = "/";
      if (typeof fn !== "function") {
        var arg = fn;
        while (Array.isArray(arg) && arg.length !== 0) {
          arg = arg[0];
        }
        if (typeof arg !== "function") {
          offset = 1;
          path = fn;
        }
      }
      var fns = flatten(slice.call(arguments, offset));
      if (fns.length === 0) {
        throw new TypeError("app.use() requires a middleware function");
      }
      this.lazyrouter();
      var router2 = this._router;
      fns.forEach(function(fn2) {
        if (!fn2 || !fn2.handle || !fn2.set) {
          return router2.use(path, fn2);
        }
        debug(".use app under %s", path);
        fn2.mountpath = path;
        fn2.parent = this;
        router2.use(path, function mounted_app(req, res, next) {
          var orig = req.app;
          fn2.handle(req, res, function(err) {
            setPrototypeOf(req, orig.request);
            setPrototypeOf(res, orig.response);
            next(err);
          });
        });
        fn2.emit("mount", this);
      }, this);
      return this;
    };
    app2.route = function route2(path) {
      this.lazyrouter();
      return this._router.route(path);
    };
    app2.engine = function engine(ext, fn) {
      if (typeof fn !== "function") {
        throw new Error("callback function required");
      }
      var extension = ext[0] !== "." ? "." + ext : ext;
      this.engines[extension] = fn;
      return this;
    };
    app2.param = function param(name, fn) {
      this.lazyrouter();
      if (Array.isArray(name)) {
        for (var i = 0; i < name.length; i++) {
          this.param(name[i], fn);
        }
        return this;
      }
      this._router.param(name, fn);
      return this;
    };
    app2.set = function set(setting, val) {
      if (arguments.length === 1) {
        var settings = this.settings;
        while (settings && settings !== Object.prototype) {
          if (hasOwnProperty.call(settings, setting)) {
            return settings[setting];
          }
          settings = Object.getPrototypeOf(settings);
        }
        return void 0;
      }
      debug('set "%s" to %o', setting, val);
      this.settings[setting] = val;
      switch (setting) {
        case "etag":
          this.set("etag fn", compileETag(val));
          break;
        case "query parser":
          this.set("query parser fn", compileQueryParser(val));
          break;
        case "trust proxy":
          this.set("trust proxy fn", compileTrust(val));
          Object.defineProperty(this.settings, trustProxyDefaultSymbol, {
            configurable: true,
            value: false
          });
          break;
      }
      return this;
    };
    app2.path = function path() {
      return this.parent ? this.parent.path() + this.mountpath : "";
    };
    app2.enabled = function enabled(setting) {
      return Boolean(this.set(setting));
    };
    app2.disabled = function disabled(setting) {
      return !this.set(setting);
    };
    app2.enable = function enable(setting) {
      return this.set(setting, true);
    };
    app2.disable = function disable(setting) {
      return this.set(setting, false);
    };
    methods.forEach(function(method) {
      app2[method] = function(path) {
        if (method === "get" && arguments.length === 1) {
          return this.set(path);
        }
        this.lazyrouter();
        var route2 = this._router.route(path);
        route2[method].apply(route2, slice.call(arguments, 1));
        return this;
      };
    });
    app2.all = function all(path) {
      this.lazyrouter();
      var route2 = this._router.route(path);
      var args = slice.call(arguments, 1);
      for (var i = 0; i < methods.length; i++) {
        route2[methods[i]].apply(route2, args);
      }
      return this;
    };
    app2.del = deprecate.function(app2.delete, "app.del: Use app.delete instead");
    app2.render = function render(name, options, callback) {
      var cache = this.cache;
      var done = callback;
      var engines = this.engines;
      var opts = options;
      var renderOptions = {};
      var view2;
      if (typeof options === "function") {
        done = options;
        opts = {};
      }
      merge(renderOptions, this.locals);
      if (opts._locals) {
        merge(renderOptions, opts._locals);
      }
      merge(renderOptions, opts);
      if (renderOptions.cache == null) {
        renderOptions.cache = this.enabled("view cache");
      }
      if (renderOptions.cache) {
        view2 = cache[name];
      }
      if (!view2) {
        var View2 = this.get("view");
        view2 = new View2(name, {
          defaultEngine: this.get("view engine"),
          root: this.get("views"),
          engines
        });
        if (!view2.path) {
          var dirs = Array.isArray(view2.root) && view2.root.length > 1 ? 'directories "' + view2.root.slice(0, -1).join('", "') + '" or "' + view2.root[view2.root.length - 1] + '"' : 'directory "' + view2.root + '"';
          var err = new Error('Failed to lookup view "' + name + '" in views ' + dirs);
          err.view = view2;
          return done(err);
        }
        if (renderOptions.cache) {
          cache[name] = view2;
        }
      }
      tryRender(view2, renderOptions, done);
    };
    app2.listen = function listen() {
      var server = http.createServer(this);
      return server.listen.apply(server, arguments);
    };
    function logerror(err) {
      if (this.get("env") !== "test") console.error(err.stack || err.toString());
    }
    function tryRender(view2, options, callback) {
      try {
        view2.render(options, callback);
      } catch (err) {
        callback(err);
      }
    }
  })(application);
  return application.exports;
}
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var request;
var hasRequiredRequest;
function requireRequest() {
  if (hasRequiredRequest) return request;
  hasRequiredRequest = 1;
  var accepts = require$$0$4;
  var deprecate = require$$3("express");
  var isIP = require$$2$4.isIP;
  var typeis = require$$3$1;
  var http = require$$7$2;
  var fresh = require$$5$1;
  var parseRange = require$$6$1;
  var parse = require$$7;
  var proxyaddr = require$$7$1;
  var req = Object.create(http.IncomingMessage.prototype);
  request = req;
  req.get = req.header = function header(name) {
    if (!name) {
      throw new TypeError("name argument is required to req.get");
    }
    if (typeof name !== "string") {
      throw new TypeError("name must be a string to req.get");
    }
    var lc = name.toLowerCase();
    switch (lc) {
      case "referer":
      case "referrer":
        return this.headers.referrer || this.headers.referer;
      default:
        return this.headers[lc];
    }
  };
  req.accepts = function() {
    var accept = accepts(this);
    return accept.types.apply(accept, arguments);
  };
  req.acceptsEncodings = function() {
    var accept = accepts(this);
    return accept.encodings.apply(accept, arguments);
  };
  req.acceptsEncoding = deprecate.function(
    req.acceptsEncodings,
    "req.acceptsEncoding: Use acceptsEncodings instead"
  );
  req.acceptsCharsets = function() {
    var accept = accepts(this);
    return accept.charsets.apply(accept, arguments);
  };
  req.acceptsCharset = deprecate.function(
    req.acceptsCharsets,
    "req.acceptsCharset: Use acceptsCharsets instead"
  );
  req.acceptsLanguages = function() {
    var accept = accepts(this);
    return accept.languages.apply(accept, arguments);
  };
  req.acceptsLanguage = deprecate.function(
    req.acceptsLanguages,
    "req.acceptsLanguage: Use acceptsLanguages instead"
  );
  req.range = function range(size, options) {
    var range2 = this.get("Range");
    if (!range2) return;
    return parseRange(size, range2, options);
  };
  req.param = function param(name, defaultValue) {
    var params = this.params || {};
    var body = this.body || {};
    var query2 = this.query || {};
    var args = arguments.length === 1 ? "name" : "name, default";
    deprecate("req.param(" + args + "): Use req.params, req.body, or req.query instead");
    if (null != params[name] && params.hasOwnProperty(name)) return params[name];
    if (null != body[name]) return body[name];
    if (null != query2[name]) return query2[name];
    return defaultValue;
  };
  req.is = function is(types) {
    var arr = types;
    if (!Array.isArray(types)) {
      arr = new Array(arguments.length);
      for (var i = 0; i < arr.length; i++) {
        arr[i] = arguments[i];
      }
    }
    return typeis(this, arr);
  };
  defineGetter(req, "protocol", function protocol() {
    var proto = this.connection.encrypted ? "https" : "http";
    var trust = this.app.get("trust proxy fn");
    if (!trust(this.connection.remoteAddress, 0)) {
      return proto;
    }
    var header = this.get("X-Forwarded-Proto") || proto;
    var index = header.indexOf(",");
    return index !== -1 ? header.substring(0, index).trim() : header.trim();
  });
  defineGetter(req, "secure", function secure() {
    return this.protocol === "https";
  });
  defineGetter(req, "ip", function ip() {
    var trust = this.app.get("trust proxy fn");
    return proxyaddr(this, trust);
  });
  defineGetter(req, "ips", function ips() {
    var trust = this.app.get("trust proxy fn");
    var addrs = proxyaddr.all(this, trust);
    addrs.reverse().pop();
    return addrs;
  });
  defineGetter(req, "subdomains", function subdomains() {
    var hostname = this.hostname;
    if (!hostname) return [];
    var offset = this.app.get("subdomain offset");
    var subdomains2 = !isIP(hostname) ? hostname.split(".").reverse() : [hostname];
    return subdomains2.slice(offset);
  });
  defineGetter(req, "path", function path() {
    return parse(this).pathname;
  });
  defineGetter(req, "hostname", function hostname() {
    var trust = this.app.get("trust proxy fn");
    var host = this.get("X-Forwarded-Host");
    if (!host || !trust(this.connection.remoteAddress, 0)) {
      host = this.get("Host");
    } else if (host.indexOf(",") !== -1) {
      host = host.substring(0, host.indexOf(",")).trimRight();
    }
    if (!host) return;
    var offset = host[0] === "[" ? host.indexOf("]") + 1 : 0;
    var index = host.indexOf(":", offset);
    return index !== -1 ? host.substring(0, index) : host;
  });
  defineGetter(req, "host", deprecate.function(function host() {
    return this.hostname;
  }, "req.host: Use req.hostname instead"));
  defineGetter(req, "fresh", function() {
    var method = this.method;
    var res = this.res;
    var status = res.statusCode;
    if ("GET" !== method && "HEAD" !== method) return false;
    if (status >= 200 && status < 300 || 304 === status) {
      return fresh(this.headers, {
        "etag": res.get("ETag"),
        "last-modified": res.get("Last-Modified")
      });
    }
    return false;
  });
  defineGetter(req, "stale", function stale() {
    return !this.fresh;
  });
  defineGetter(req, "xhr", function xhr() {
    var val = this.get("X-Requested-With") || "";
    return val.toLowerCase() === "xmlhttprequest";
  });
  function defineGetter(obj, name, getter) {
    Object.defineProperty(obj, name, {
      configurable: true,
      enumerable: true,
      get: getter
    });
  }
  return request;
}
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var response;
var hasRequiredResponse;
function requireResponse() {
  if (hasRequiredResponse) return response;
  hasRequiredResponse = 1;
  var Buffer = require$$0$2.Buffer;
  var contentDisposition = require$$1$2;
  var createError = require$$2$5;
  var deprecate = require$$3("express");
  var encodeUrl = require$$4;
  var escapeHtml = require$$5$2;
  var http = require$$7$2;
  var isAbsolute = requireUtils().isAbsolute;
  var onFinished = require$$8$1;
  var path = require$$1$1;
  var statuses = require$$10;
  var merge = require$$11;
  var sign = require$$12.sign;
  var normalizeType = requireUtils().normalizeType;
  var normalizeTypes = requireUtils().normalizeTypes;
  var setCharset = requireUtils().setCharset;
  var cookie = require$$13;
  var send = require$$5;
  var extname = path.extname;
  var mime = send.mime;
  var resolve = path.resolve;
  var vary = require$$15;
  var res = Object.create(http.ServerResponse.prototype);
  response = res;
  var charsetRegExp = /;\s*charset\s*=/;
  res.status = function status(code) {
    if ((typeof code === "string" || Math.floor(code) !== code) && code > 99 && code < 1e3) {
      deprecate("res.status(" + JSON.stringify(code) + "): use res.status(" + Math.floor(code) + ") instead");
    }
    this.statusCode = code;
    return this;
  };
  res.links = function(links) {
    var link = this.get("Link") || "";
    if (link) link += ", ";
    return this.set("Link", link + Object.keys(links).map(function(rel) {
      return "<" + links[rel] + '>; rel="' + rel + '"';
    }).join(", "));
  };
  res.send = function send2(body) {
    var chunk = body;
    var encoding;
    var req = this.req;
    var type;
    var app2 = this.app;
    if (arguments.length === 2) {
      if (typeof arguments[0] !== "number" && typeof arguments[1] === "number") {
        deprecate("res.send(body, status): Use res.status(status).send(body) instead");
        this.statusCode = arguments[1];
      } else {
        deprecate("res.send(status, body): Use res.status(status).send(body) instead");
        this.statusCode = arguments[0];
        chunk = arguments[1];
      }
    }
    if (typeof chunk === "number" && arguments.length === 1) {
      if (!this.get("Content-Type")) {
        this.type("txt");
      }
      deprecate("res.send(status): Use res.sendStatus(status) instead");
      this.statusCode = chunk;
      chunk = statuses.message[chunk];
    }
    switch (typeof chunk) {
      // string defaulting to html
      case "string":
        if (!this.get("Content-Type")) {
          this.type("html");
        }
        break;
      case "boolean":
      case "number":
      case "object":
        if (chunk === null) {
          chunk = "";
        } else if (Buffer.isBuffer(chunk)) {
          if (!this.get("Content-Type")) {
            this.type("bin");
          }
        } else {
          return this.json(chunk);
        }
        break;
    }
    if (typeof chunk === "string") {
      encoding = "utf8";
      type = this.get("Content-Type");
      if (typeof type === "string") {
        this.set("Content-Type", setCharset(type, "utf-8"));
      }
    }
    var etagFn = app2.get("etag fn");
    var generateETag = !this.get("ETag") && typeof etagFn === "function";
    var len;
    if (chunk !== void 0) {
      if (Buffer.isBuffer(chunk)) {
        len = chunk.length;
      } else if (!generateETag && chunk.length < 1e3) {
        len = Buffer.byteLength(chunk, encoding);
      } else {
        chunk = Buffer.from(chunk, encoding);
        encoding = void 0;
        len = chunk.length;
      }
      this.set("Content-Length", len);
    }
    var etag;
    if (generateETag && len !== void 0) {
      if (etag = etagFn(chunk, encoding)) {
        this.set("ETag", etag);
      }
    }
    if (req.fresh) this.statusCode = 304;
    if (204 === this.statusCode || 304 === this.statusCode) {
      this.removeHeader("Content-Type");
      this.removeHeader("Content-Length");
      this.removeHeader("Transfer-Encoding");
      chunk = "";
    }
    if (this.statusCode === 205) {
      this.set("Content-Length", "0");
      this.removeHeader("Transfer-Encoding");
      chunk = "";
    }
    if (req.method === "HEAD") {
      this.end();
    } else {
      this.end(chunk, encoding);
    }
    return this;
  };
  res.json = function json(obj) {
    var val = obj;
    if (arguments.length === 2) {
      if (typeof arguments[1] === "number") {
        deprecate("res.json(obj, status): Use res.status(status).json(obj) instead");
        this.statusCode = arguments[1];
      } else {
        deprecate("res.json(status, obj): Use res.status(status).json(obj) instead");
        this.statusCode = arguments[0];
        val = arguments[1];
      }
    }
    var app2 = this.app;
    var escape = app2.get("json escape");
    var replacer = app2.get("json replacer");
    var spaces = app2.get("json spaces");
    var body = stringify(val, replacer, spaces, escape);
    if (!this.get("Content-Type")) {
      this.set("Content-Type", "application/json");
    }
    return this.send(body);
  };
  res.jsonp = function jsonp(obj) {
    var val = obj;
    if (arguments.length === 2) {
      if (typeof arguments[1] === "number") {
        deprecate("res.jsonp(obj, status): Use res.status(status).jsonp(obj) instead");
        this.statusCode = arguments[1];
      } else {
        deprecate("res.jsonp(status, obj): Use res.status(status).jsonp(obj) instead");
        this.statusCode = arguments[0];
        val = arguments[1];
      }
    }
    var app2 = this.app;
    var escape = app2.get("json escape");
    var replacer = app2.get("json replacer");
    var spaces = app2.get("json spaces");
    var body = stringify(val, replacer, spaces, escape);
    var callback = this.req.query[app2.get("jsonp callback name")];
    if (!this.get("Content-Type")) {
      this.set("X-Content-Type-Options", "nosniff");
      this.set("Content-Type", "application/json");
    }
    if (Array.isArray(callback)) {
      callback = callback[0];
    }
    if (typeof callback === "string" && callback.length !== 0) {
      this.set("X-Content-Type-Options", "nosniff");
      this.set("Content-Type", "text/javascript");
      callback = callback.replace(/[^\[\]\w$.]/g, "");
      if (body === void 0) {
        body = "";
      } else if (typeof body === "string") {
        body = body.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
      }
      body = "/**/ typeof " + callback + " === 'function' && " + callback + "(" + body + ");";
    }
    return this.send(body);
  };
  res.sendStatus = function sendStatus(statusCode) {
    var body = statuses.message[statusCode] || String(statusCode);
    this.statusCode = statusCode;
    this.type("txt");
    return this.send(body);
  };
  res.sendFile = function sendFile(path2, options, callback) {
    var done = callback;
    var req = this.req;
    var res2 = this;
    var next = req.next;
    var opts = options || {};
    if (!path2) {
      throw new TypeError("path argument is required to res.sendFile");
    }
    if (typeof path2 !== "string") {
      throw new TypeError("path must be a string to res.sendFile");
    }
    if (typeof options === "function") {
      done = options;
      opts = {};
    }
    if (!opts.root && !isAbsolute(path2)) {
      throw new TypeError("path must be absolute or specify root to res.sendFile");
    }
    var pathname = encodeURI(path2);
    var file = send(req, pathname, opts);
    sendfile(res2, file, opts, function(err) {
      if (done) return done(err);
      if (err && err.code === "EISDIR") return next();
      if (err && err.code !== "ECONNABORTED" && err.syscall !== "write") {
        next(err);
      }
    });
  };
  res.sendfile = function(path2, options, callback) {
    var done = callback;
    var req = this.req;
    var res2 = this;
    var next = req.next;
    var opts = options || {};
    if (typeof options === "function") {
      done = options;
      opts = {};
    }
    var file = send(req, path2, opts);
    sendfile(res2, file, opts, function(err) {
      if (done) return done(err);
      if (err && err.code === "EISDIR") return next();
      if (err && err.code !== "ECONNABORTED" && err.syscall !== "write") {
        next(err);
      }
    });
  };
  res.sendfile = deprecate.function(
    res.sendfile,
    "res.sendfile: Use res.sendFile instead"
  );
  res.download = function download(path2, filename, options, callback) {
    var done = callback;
    var name = filename;
    var opts = options || null;
    if (typeof filename === "function") {
      done = filename;
      name = null;
      opts = null;
    } else if (typeof options === "function") {
      done = options;
      opts = null;
    }
    if (typeof filename === "object" && (typeof options === "function" || options === void 0)) {
      name = null;
      opts = filename;
    }
    var headers = {
      "Content-Disposition": contentDisposition(name || path2)
    };
    if (opts && opts.headers) {
      var keys = Object.keys(opts.headers);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.toLowerCase() !== "content-disposition") {
          headers[key] = opts.headers[key];
        }
      }
    }
    opts = Object.create(opts);
    opts.headers = headers;
    var fullPath = !opts.root ? resolve(path2) : path2;
    return this.sendFile(fullPath, opts, done);
  };
  res.contentType = res.type = function contentType(type) {
    var ct = type.indexOf("/") === -1 ? mime.lookup(type) : type;
    return this.set("Content-Type", ct);
  };
  res.format = function(obj) {
    var req = this.req;
    var next = req.next;
    var keys = Object.keys(obj).filter(function(v) {
      return v !== "default";
    });
    var key = keys.length > 0 ? req.accepts(keys) : false;
    this.vary("Accept");
    if (key) {
      this.set("Content-Type", normalizeType(key).value);
      obj[key](req, this, next);
    } else if (obj.default) {
      obj.default(req, this, next);
    } else {
      next(createError(406, {
        types: normalizeTypes(keys).map(function(o) {
          return o.value;
        })
      }));
    }
    return this;
  };
  res.attachment = function attachment(filename) {
    if (filename) {
      this.type(extname(filename));
    }
    this.set("Content-Disposition", contentDisposition(filename));
    return this;
  };
  res.append = function append(field, val) {
    var prev = this.get(field);
    var value = val;
    if (prev) {
      value = Array.isArray(prev) ? prev.concat(val) : Array.isArray(val) ? [prev].concat(val) : [prev, val];
    }
    return this.set(field, value);
  };
  res.set = res.header = function header(field, val) {
    if (arguments.length === 2) {
      var value = Array.isArray(val) ? val.map(String) : String(val);
      if (field.toLowerCase() === "content-type") {
        if (Array.isArray(value)) {
          throw new TypeError("Content-Type cannot be set to an Array");
        }
        if (!charsetRegExp.test(value)) {
          var charset = mime.charsets.lookup(value.split(";")[0]);
          if (charset) value += "; charset=" + charset.toLowerCase();
        }
      }
      this.setHeader(field, value);
    } else {
      for (var key in field) {
        this.set(key, field[key]);
      }
    }
    return this;
  };
  res.get = function(field) {
    return this.getHeader(field);
  };
  res.clearCookie = function clearCookie(name, options) {
    if (options) {
      if (options.maxAge) {
        deprecate('res.clearCookie: Passing "options.maxAge" is deprecated. In v5.0.0 of Express, this option will be ignored, as res.clearCookie will automatically set cookies to expire immediately. Please update your code to omit this option.');
      }
      if (options.expires) {
        deprecate('res.clearCookie: Passing "options.expires" is deprecated. In v5.0.0 of Express, this option will be ignored, as res.clearCookie will automatically set cookies to expire immediately. Please update your code to omit this option.');
      }
    }
    var opts = merge({ expires: /* @__PURE__ */ new Date(1), path: "/" }, options);
    return this.cookie(name, "", opts);
  };
  res.cookie = function(name, value, options) {
    var opts = merge({}, options);
    var secret = this.req.secret;
    var signed = opts.signed;
    if (signed && !secret) {
      throw new Error('cookieParser("secret") required for signed cookies');
    }
    var val = typeof value === "object" ? "j:" + JSON.stringify(value) : String(value);
    if (signed) {
      val = "s:" + sign(val, secret);
    }
    if (opts.maxAge != null) {
      var maxAge = opts.maxAge - 0;
      if (!isNaN(maxAge)) {
        opts.expires = new Date(Date.now() + maxAge);
        opts.maxAge = Math.floor(maxAge / 1e3);
      }
    }
    if (opts.path == null) {
      opts.path = "/";
    }
    this.append("Set-Cookie", cookie.serialize(name, String(val), opts));
    return this;
  };
  res.location = function location(url) {
    var loc;
    if (url === "back") {
      deprecate('res.location("back"): use res.location(req.get("Referrer") || "/") and refer to https://dub.sh/security-redirect for best practices');
      loc = this.req.get("Referrer") || "/";
    } else {
      loc = String(url);
    }
    return this.set("Location", encodeUrl(loc));
  };
  res.redirect = function redirect(url) {
    var address = url;
    var body;
    var status = 302;
    if (arguments.length === 2) {
      if (typeof arguments[0] === "number") {
        status = arguments[0];
        address = arguments[1];
      } else {
        deprecate("res.redirect(url, status): Use res.redirect(status, url) instead");
        status = arguments[1];
      }
    }
    address = this.location(address).get("Location");
    this.format({
      text: function() {
        body = statuses.message[status] + ". Redirecting to " + address;
      },
      html: function() {
        var u = escapeHtml(address);
        body = "<p>" + statuses.message[status] + ". Redirecting to " + u + "</p>";
      },
      default: function() {
        body = "";
      }
    });
    this.statusCode = status;
    this.set("Content-Length", Buffer.byteLength(body));
    if (this.req.method === "HEAD") {
      this.end();
    } else {
      this.end(body);
    }
  };
  res.vary = function(field) {
    if (!field || Array.isArray(field) && !field.length) {
      deprecate("res.vary(): Provide a field name");
      return this;
    }
    vary(this, field);
    return this;
  };
  res.render = function render(view2, options, callback) {
    var app2 = this.req.app;
    var done = callback;
    var opts = options || {};
    var req = this.req;
    var self = this;
    if (typeof options === "function") {
      done = options;
      opts = {};
    }
    opts._locals = self.locals;
    done = done || function(err, str) {
      if (err) return req.next(err);
      self.send(str);
    };
    app2.render(view2, opts, done);
  };
  function sendfile(res2, file, options, callback) {
    var done = false;
    var streaming;
    function onaborted() {
      if (done) return;
      done = true;
      var err = new Error("Request aborted");
      err.code = "ECONNABORTED";
      callback(err);
    }
    function ondirectory() {
      if (done) return;
      done = true;
      var err = new Error("EISDIR, read");
      err.code = "EISDIR";
      callback(err);
    }
    function onerror(err) {
      if (done) return;
      done = true;
      callback(err);
    }
    function onend() {
      if (done) return;
      done = true;
      callback();
    }
    function onfile() {
      streaming = false;
    }
    function onfinish(err) {
      if (err && err.code === "ECONNRESET") return onaborted();
      if (err) return onerror(err);
      if (done) return;
      setImmediate(function() {
        if (streaming !== false && !done) {
          onaborted();
          return;
        }
        if (done) return;
        done = true;
        callback();
      });
    }
    function onstream() {
      streaming = true;
    }
    file.on("directory", ondirectory);
    file.on("end", onend);
    file.on("error", onerror);
    file.on("file", onfile);
    file.on("stream", onstream);
    onFinished(res2, onfinish);
    if (options.headers) {
      file.on("headers", function headers(res3) {
        var obj = options.headers;
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          res3.setHeader(k, obj[k]);
        }
      });
    }
    file.pipe(res2);
  }
  function stringify(value, replacer, spaces, escape) {
    var json = replacer || spaces ? JSON.stringify(value, replacer, spaces) : JSON.stringify(value);
    if (escape && typeof json === "string") {
      json = json.replace(/[<>&]/g, function(c) {
        switch (c.charCodeAt(0)) {
          case 60:
            return "\\u003c";
          case 62:
            return "\\u003e";
          case 38:
            return "\\u0026";
          /* istanbul ignore next: unreachable default */
          default:
            return c;
        }
      });
    }
    return json;
  }
  return response;
}
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var hasRequiredExpress$1;
function requireExpress$1() {
  if (hasRequiredExpress$1) return express$2.exports;
  hasRequiredExpress$1 = 1;
  (function(module, exports) {
    var bodyParser = require$$0$5;
    var EventEmitter = require$$1$3.EventEmitter;
    var mixin = require$$2$6;
    var proto = requireApplication();
    var Route = requireRoute();
    var Router = requireRouter();
    var req = requireRequest();
    var res = requireResponse();
    exports = module.exports = createApplication;
    function createApplication() {
      var app2 = function(req2, res2, next) {
        app2.handle(req2, res2, next);
      };
      mixin(app2, EventEmitter.prototype, false);
      mixin(app2, proto, false);
      app2.request = Object.create(req, {
        app: { configurable: true, enumerable: true, writable: true, value: app2 }
      });
      app2.response = Object.create(res, {
        app: { configurable: true, enumerable: true, writable: true, value: app2 }
      });
      app2.init();
      return app2;
    }
    exports.application = proto;
    exports.request = req;
    exports.response = res;
    exports.Route = Route;
    exports.Router = Router;
    exports.json = bodyParser.json;
    exports.query = requireQuery();
    exports.raw = bodyParser.raw;
    exports.static = require$$9$1;
    exports.text = bodyParser.text;
    exports.urlencoded = bodyParser.urlencoded;
    var removedMiddlewares = [
      "bodyParser",
      "compress",
      "cookieSession",
      "session",
      "logger",
      "cookieParser",
      "favicon",
      "responseTime",
      "errorHandler",
      "timeout",
      "methodOverride",
      "vhost",
      "csrf",
      "directory",
      "limit",
      "multipart",
      "staticCache"
    ];
    removedMiddlewares.forEach(function(name) {
      Object.defineProperty(exports, name, {
        get: function() {
          throw new Error("Most middleware (like " + name + ") is no longer bundled with Express and must be installed separately. Please see https://github.com/senchalabs/connect#middleware.");
        },
        configurable: true
      });
    });
  })(express$2, express$2.exports);
  return express$2.exports;
}
/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var express$1;
var hasRequiredExpress;
function requireExpress() {
  if (hasRequiredExpress) return express$1;
  hasRequiredExpress = 1;
  express$1 = requireExpress$1();
  return express$1;
}
var expressExports = requireExpress();
const express = /* @__PURE__ */ getDefaultExportFromCjs(expressExports);
const handleDemo = (req, res) => {
  res.json({
    message: "Hello from the demo API endpoint!",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    method: req.method,
    path: req.path
  });
};
async function addPaymentColumns() {
  try {
    console.log("Adding payment columns to bookings table...");
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_status ENUM('not_required', 'pending', 'completed', 'failed') DEFAULT 'not_required'
    `).catch((err) => {
      if (!err.message.includes("Duplicate column name")) {
        throw err;
      }
    });
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255)
    `).catch((err) => {
      if (!err.message.includes("Duplicate column name")) {
        throw err;
      }
    });
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255)
    `).catch((err) => {
      if (!err.message.includes("Duplicate column name")) {
        throw err;
      }
    });
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP NULL
    `).catch((err) => {
      if (!err.message.includes("Duplicate column name")) {
        throw err;
      }
    });
    await pool.execute(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS payment_error_description TEXT
    `).catch((err) => {
      if (!err.message.includes("Duplicate column name")) {
        throw err;
      }
    });
    await pool.execute(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT NULL
    `).catch((err) => {
      if (!err.message.includes("Duplicate column name")) {
        throw err;
      }
    });
    await pool.execute(`
      UPDATE bookings b
      JOIN venues v ON b.venue_id = v.id
      SET b.payment_amount = v.price_per_day
      WHERE b.payment_amount IS NULL
    `).catch((err) => {
      console.log("Note: Could not update existing payment_amount values:", err.message);
    });
    await pool.execute(`
      ALTER TABLE bookings 
      ADD INDEX IF NOT EXISTS idx_payment_status (payment_status)
    `).catch((err) => {
      if (!err.message.includes("Duplicate key name")) {
        throw err;
      }
    });
    await pool.execute(`
      ALTER TABLE bookings 
      ADD INDEX IF NOT EXISTS idx_razorpay_order (razorpay_order_id)
    `).catch((err) => {
      if (!err.message.includes("Duplicate key name")) {
        throw err;
      }
    });
    console.log("Payment columns added successfully to bookings table");
  } catch (error) {
    console.error("Error adding payment columns:", error);
  }
}
async function addVenueTypeColumn() {
  try {
    console.log("Adding venue type column to venues table...");
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'venues' 
      AND COLUMN_NAME = 'type'
    `);
    if (columns.length === 0) {
      await pool.execute(`
        ALTER TABLE venues 
        ADD COLUMN type VARCHAR(100) DEFAULT 'Venue' AFTER description
      `);
      console.log("Successfully added type column to venues table");
      await pool.execute(`
        UPDATE venues 
        SET type = CASE 
          WHEN LOWER(name) LIKE '%banquet%' OR LOWER(description) LIKE '%banquet%' THEN 'Banquet halls'
          WHEN LOWER(name) LIKE '%hotel%' OR LOWER(name) LIKE '%resort%' OR LOWER(description) LIKE '%hotel%' OR LOWER(description) LIKE '%resort%' THEN 'Hotels & resorts'
          WHEN LOWER(name) LIKE '%lawn%' OR LOWER(name) LIKE '%garden%' OR LOWER(description) LIKE '%lawn%' OR LOWER(description) LIKE '%garden%' THEN 'Lawns/gardens'
          WHEN LOWER(name) LIKE '%farmhouse%' OR LOWER(description) LIKE '%farmhouse%' THEN 'Farmhouses'
          WHEN LOWER(name) LIKE '%restaurant%' OR LOWER(name) LIKE '%cafe%' OR LOWER(description) LIKE '%restaurant%' OR LOWER(description) LIKE '%cafe%' THEN 'Restaurants & cafes'
          WHEN LOWER(name) LIKE '%lounge%' OR LOWER(name) LIKE '%rooftop%' OR LOWER(description) LIKE '%lounge%' OR LOWER(description) LIKE '%rooftop%' THEN 'Lounges & rooftops'
          WHEN LOWER(name) LIKE '%stadium%' OR LOWER(name) LIKE '%arena%' OR LOWER(description) LIKE '%stadium%' OR LOWER(description) LIKE '%arena%' THEN 'Stadiums & arenas'
          WHEN LOWER(name) LIKE '%ground%' OR LOWER(description) LIKE '%ground%' THEN 'Open grounds'
          WHEN LOWER(name) LIKE '%auditorium%' OR LOWER(description) LIKE '%auditorium%' THEN 'Auditoriums'
          ELSE 'Venue'
        END 
        WHERE type = 'Venue' OR type IS NULL
      `);
      console.log("Updated existing venues with default types");
    } else {
      console.log("Type column already exists in venues table");
    }
  } catch (error) {
    console.error("Error adding venue type column:", error);
  }
}
dotenv.config();
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});
async function initializeDatabase() {
  try {
    console.log("Starting database initialization...");
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        profile_picture VARCHAR(500),
        mobile_number VARCHAR(20),
        business_name VARCHAR(255),
        location VARCHAR(255),
        user_type ENUM('customer', 'venue-owner') DEFAULT 'customer',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS venues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        capacity INT NOT NULL,
        price_per_day DECIMAL(10,2) NOT NULL,
        price_min DECIMAL(10,2),
        price_max DECIMAL(10,2),
        status ENUM('active', 'inactive') DEFAULT 'active',
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_bookings INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_owner (owner_id),
        INDEX idx_location (location),
        INDEX idx_status (status)
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS venue_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS venue_facilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_id INT NOT NULL,
        facility_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_id INT NOT NULL,
        customer_id INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        event_date DATE NOT NULL,
        event_type VARCHAR(100),
        guest_count INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('not_required', 'pending', 'completed', 'failed') DEFAULT 'not_required',
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        payment_completed_at TIMESTAMP NULL,
        payment_error_description TEXT,
        special_requirements TEXT,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_venue (venue_id),
        INDEX idx_customer (customer_id),
        INDEX idx_event_date (event_date),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_razorpay_order (razorpay_order_id)
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        pending_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_otp (email, otp)
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        venue_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_venue (user_id, venue_id)
      )
    `);
    console.log("Database tables verified/created successfully");
    await addPaymentColumns();
    await addVenueTypeColumn();
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
dotenv.config();
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      userType: user.user_type
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
  req.user = decoded;
  next();
}
dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
async function sendOTPEmail(email, otp, name = "User", purpose = "Verification") {
  console.log("sendOTPEmail called with:", { email, purpose, name });
  console.log("Email configuration:", {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? "[SET]" : "[NOT SET]"
  });
  const isPasswordReset = purpose === "Password Reset";
  const isEmailUpdate = purpose === "Email Update";
  const mailOptions = {
    from: {
      name: "VenueKart",
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: isPasswordReset ? "VenueKart - Password Reset Verification" : isEmailUpdate ? "VenueKart - Email Address Verification" : "VenueKart - Account Verification",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VenueKart Verification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3C3B6E 0%, #6C63FF 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Professional Venue Solutions</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
              ${isPasswordReset ? "Password Reset Request" : isEmailUpdate ? "Email Verification Required" : "Account Verification Required"}
            </h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Dear ${name},
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              ${isPasswordReset ? "We received a request to reset your password. Please use the verification code below to proceed with resetting your password." : isEmailUpdate ? "To complete the update of your email address, please verify using the code below." : "Thank you for registering with VenueKart. To activate your account, please verify your email address using the code below."}
            </p>

            <!-- Verification Code -->
            <div style="text-align: center; margin: 40px 0;">
              <div style="background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 30px; display: inline-block;">
                <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Verification Code</p>
                <div style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #3C3B6E; letter-spacing: 8px; margin: 0;">
                  ${otp}
                </div>
              </div>
            </div>

            <div style="background: #f7fafc; border-left: 4px solid #6C63FF; padding: 20px; margin: 30px 0; border-radius: 0 4px 4px 0;">
              <p style="color: #4a5568; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Important:</strong> This verification code will expire in 10 minutes for your security. If you did not request this ${isPasswordReset ? "password reset" : isEmailUpdate ? "email update" : "verification"}, please ignore this email.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 14px;">
              This is an automated message from VenueKart. Please do not reply to this email.
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${(/* @__PURE__ */ new Date()).getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  try {
    console.log("Attempting to send OTP email...");
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return false;
  }
}
async function sendVenueInquiryEmail(ownerEmail, inquiryData) {
  const { venue, customer, event, owner } = inquiryData;
  const mailOptions = {
    from: {
      name: "VenueKart",
      address: process.env.EMAIL_USER
    },
    to: ownerEmail,
    subject: `New Booking Inquiry - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Inquiry</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3C3B6E 0%, #6C63FF 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">New Booking Inquiry</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Booking Request</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              You have received a new booking inquiry for your venue <strong>${venue.name}</strong>. Please review the details below.
            </p>

            <!-- Venue Information -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Information</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Customer Information -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Information</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #3C3B6E;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Customer Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${customer.name}</td>
                  </tr>
                </table>
                <div style="background: #fff5cd; border: 1px solid #f6e05e; border-radius: 4px; padding: 15px; margin-top: 15px;">
                  <p style="color: #744210; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>Privacy Notice:</strong> Customer contact details are protected and will be shared upon inquiry acceptance through your VenueKart dashboard.
                  </p>
                </div>
              </div>
            </div>

            <!-- Event Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Event Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || "None specified"}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Your Contact Information -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Your Contact Information</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #805ad5;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Email:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.email || ownerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.phone || "Not provided"}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #234e52; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Action Required</h3>
              <p style="color: #285e61; margin: 0; font-size: 14px; line-height: 1.5;">
                Please review this inquiry and respond through your VenueKart dashboard within 24 hours. Log in to your account to accept or decline this booking request.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              This inquiry was submitted through VenueKart. Customer contact details will be shared upon acceptance.
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${(/* @__PURE__ */ new Date()).getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Venue inquiry email sent successfully to ${ownerEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending venue inquiry email:", error);
    return false;
  }
}
async function sendInquiryNotificationToVenueKart(inquiryData) {
  const { venue, customer, event, owner } = inquiryData;
  const venuekartEmail = process.env.VENUEKART_ADMIN_EMAIL || process.env.EMAIL_USER;
  const mailOptions = {
    from: {
      name: "VenueKart System",
      address: process.env.EMAIL_USER
    },
    to: venuekartEmail,
    subject: `[ADMIN] New Venue Inquiry - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Notification - New Inquiry</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e53e3e 0%, #fc8181 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">ADMIN NOTIFICATION</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Venue Inquiry Received</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              A new venue inquiry has been submitted through the platform. Complete details are provided below for monitoring and quality assurance.
            </p>

            <!-- Inquiry Summary -->
            <div style="background: #fff5cd; border: 1px solid #f6e05e; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #744210; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Inquiry Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #744210; font-weight: 600; width: 30%;">Venue:</td>
                  <td style="padding: 8px 0; color: #744210;">${venue.name} ${venue.id ? `(ID: ${venue.id})` : ""}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #744210; font-weight: 600;">Customer:</td>
                  <td style="padding: 8px 0; color: #744210;">${customer.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #744210; font-weight: 600;">Event Date:</td>
                  <td style="padding: 8px 0; color: #744210;">${new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #744210; font-weight: 600;">Event Type:</td>
                  <td style="padding: 8px 0; color: #744210;">${event.type}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #744210; font-weight: 600;">Guest Count:</td>
                  <td style="padding: 8px 0; color: #744210;">${event.guestCount}</td>
                </tr>
              </table>
            </div>

            <!-- Venue Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Price per Day:</td>
                    <td style="padding: 8px 0; color: #2d3748;">₹${venue.price}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Customer Details (Full Access for Admin) -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Details (Complete Information)</h3>
              <div style="background: #fed7d7; padding: 20px; border-radius: 6px; border-left: 4px solid #e53e3e;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600; width: 30%;">Full Name:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Email Address:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Phone Number:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.phone}</td>
                  </tr>
                </table>
                <div style="background: #fff5f5; border: 1px solid #feb2b2; border-radius: 4px; padding: 15px; margin-top: 15px;">
                  <p style="color: #742a2a; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>Admin Access:</strong> Complete customer contact information is provided for administrative monitoring and support purposes.
                  </p>
                </div>
              </div>
            </div>

            <!-- Event Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Event Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || "None specified"}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Venue Owner Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Owner Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #805ad5;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Email:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.email || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.phone || "Not provided"}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Admin Monitoring Notice -->
            <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #234e52; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Administrative Monitoring</h3>
              <p style="color: #285e61; margin: 0; font-size: 14px; line-height: 1.5;">
                This inquiry has been logged for tracking and quality assurance. Customer contact details are protected from venue owners until inquiry acceptance.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              Inquiry submitted at ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN")}
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${(/* @__PURE__ */ new Date()).getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`VenueKart admin notification email sent successfully`);
    return true;
  } catch (error) {
    console.error("Error sending VenueKart admin notification email:", error);
    return false;
  }
}
async function sendInquiryAcceptedToAdmin(inquiryData) {
  const { venue, customer, event, owner } = inquiryData;
  const venuekartEmail = process.env.VENUEKART_ADMIN_EMAIL || process.env.EMAIL_USER;
  const mailOptions = {
    from: {
      name: "VenueKart System",
      address: process.env.EMAIL_USER
    },
    to: venuekartEmail,
    subject: `[ADMIN] Venue Inquiry Accepted - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Notification - Inquiry Accepted</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #38a169 0%, #68d391 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">INQUIRY ACCEPTED</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Venue Inquiry Successfully Accepted</h2>
            
            <div style="background: #c6f6d5; border: 1px solid #38a169; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
              <h3 style="color: #276749; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Status Update</h3>
              <p style="color: #2f855a; margin: 0; font-size: 16px;">The venue owner has accepted the booking inquiry. Customer contact details have been shared.</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              The following venue inquiry has been successfully accepted by the venue owner. All relevant details are provided below for administrative tracking.
            </p>

            <!-- Complete inquiry details with same structure as admin notification -->
            <!-- Venue Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Price per Day:</td>
                    <td style="padding: 8px 0; color: #2d3748;">₹${venue.price}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Customer Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Details</h3>
              <div style="background: #fed7d7; padding: 20px; border-radius: 6px; border-left: 4px solid #e53e3e;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600; width: 30%;">Full Name:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Email Address:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Phone Number:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.phone}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Event Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Event Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || "None specified"}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Venue Owner Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Owner Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #805ad5;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Email:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.email || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.phone || "Not provided"}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              Inquiry accepted at ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN")}
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${(/* @__PURE__ */ new Date()).getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry acceptance notification sent to admin successfully`);
    return true;
  } catch (error) {
    console.error("Error sending inquiry acceptance email to admin:", error);
    return false;
  }
}
async function sendInquiryAcceptedToCustomer(customerEmail, inquiryData) {
  const { venue, customer, event } = inquiryData;
  const mailOptions = {
    from: {
      name: "VenueKart",
      address: process.env.EMAIL_USER
    },
    to: customerEmail,
    subject: `Venue Inquiry Accepted - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inquiry Accepted</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #38a169 0%, #68d391 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Excellent News!</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <!-- Acceptance Notice -->
            <div style="background: #c6f6d5; border: 1px solid #38a169; border-radius: 6px; padding: 20px; margin: 0 0 30px 0; text-align: center;">
              <h2 style="color: #276749; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Your Venue Inquiry Has Been Accepted</h2>
              <p style="color: #2f855a; margin: 0; font-size: 16px;">The venue owner has accepted your booking inquiry for <strong>${venue.name}</strong>.</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Dear ${customer.name},
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              We are pleased to inform you that your venue inquiry has been accepted. The venue owner is interested in hosting your event and you can now proceed with the booking process.
            </p>

            <!-- Venue Information -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Information</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Price per Day:</td>
                    <td style="padding: 8px 0; color: #2d3748;">₹${venue.price}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Your Event Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Your Event Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || "None specified"}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Payment Instructions -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Next Steps - Complete Your Payment</h3>
              <div style="background: #fef5e7; padding: 20px; border-radius: 6px; border-left: 4px solid #d69e2e; margin: 0 0 20px 0;">
                <p style="color: #744210; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
                  🔔 Payment Required to Confirm Your Booking
                </p>
                <p style="color: #975a16; margin: 0 0 15px 0; font-size: 14px; line-height: 1.5;">
                  To secure your booking, please complete the payment process within 48 hours. Follow these simple steps:
                </p>
                <ol style="color: #975a16; margin: 0; font-size: 14px; line-height: 1.6; padding-left: 20px;">
                  <li style="margin: 0 0 8px 0;">Log in to your VenueKart dashboard</li>
                  <li style="margin: 0 0 8px 0;">Navigate to your booking history</li>
                  <li style="margin: 0 0 8px 0;">Click "Pay Now" for this booking</li>
                  <li style="margin: 0 0 8px 0;">Complete the secure payment via Razorpay</li>
                </ol>
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.CLIENT_URL || "http://localhost:8080"}/user-dashboard"
                   style="display: inline-block; background: #3C3B6E; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Complete Payment Now
                </a>
              </div>

              <div style="background: #e6fffa; padding: 15px; border-radius: 6px; border-left: 4px solid #38b2ac;">
                <p style="color: #234e52; margin: 0; font-size: 13px; line-height: 1.5;">
                  <strong>💳 Secure Payment:</strong> All payments are processed securely through Razorpay with bank-level encryption.<br>
                  <strong>📞 Support:</strong> Contact us if you need assistance with the payment process.
                </p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #4a5568; margin: 0; font-size: 16px; line-height: 1.6;">
                Thank you for choosing VenueKart. We hope you have a wonderful event!
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              We're here to help make your event successful. Best wishes!
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${(/* @__PURE__ */ new Date()).getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry acceptance email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending inquiry acceptance email to customer:", error);
    return false;
  }
}
async function sendInquiryRejectedToAdmin(inquiryData) {
  const { venue, customer, event, owner } = inquiryData;
  const venuekartEmail = process.env.VENUEKART_ADMIN_EMAIL || process.env.EMAIL_USER;
  const mailOptions = {
    from: {
      name: "VenueKart System",
      address: process.env.EMAIL_USER
    },
    to: venuekartEmail,
    subject: `[ADMIN] Venue Inquiry Declined - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Notification - Inquiry Declined</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e53e3e 0%, #fc8181 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">INQUIRY DECLINED</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Venue Inquiry Has Been Declined</h2>
            
            <div style="background: #fed7d7; border: 1px solid #e53e3e; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
              <h3 style="color: #742a2a; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Status Update</h3>
              <p style="color: #742a2a; margin: 0; font-size: 16px;">The venue owner has declined the booking inquiry. Customer has been notified.</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              The following venue inquiry has been declined by the venue owner. All relevant details are provided below for administrative tracking.
            </p>

            <!-- Complete inquiry details - similar structure as other admin emails -->
            <!-- Venue Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Price per Day:</td>
                    <td style="padding: 8px 0; color: #2d3748;">₹${venue.price}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Customer Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Details</h3>
              <div style="background: #fed7d7; padding: 20px; border-radius: 6px; border-left: 4px solid #e53e3e;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600; width: 30%;">Full Name:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Email Address:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Phone Number:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.phone}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Event Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Event Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || "None specified"}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Venue Owner Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Owner Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #805ad5;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Email:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.email || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.phone || "Not provided"}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              Inquiry declined at ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN")}
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${(/* @__PURE__ */ new Date()).getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry rejection notification sent to admin successfully`);
    return true;
  } catch (error) {
    console.error("Error sending inquiry rejection email to admin:", error);
    return false;
  }
}
async function sendInquiryRejectedToCustomer(customerEmail, inquiryData) {
  const { venue, customer, event } = inquiryData;
  const mailOptions = {
    from: {
      name: "VenueKart",
      address: process.env.EMAIL_USER
    },
    to: customerEmail,
    subject: `Venue Inquiry Update - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inquiry Update</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3C3B6E 0%, #6C63FF 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Inquiry Update</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Inquiry Status Update</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Dear ${customer.name},
            </p>
            
            <div style="background: #fed7d7; border: 1px solid #e53e3e; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
              <h3 style="color: #742a2a; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Inquiry Status</h3>
              <p style="color: #742a2a; margin: 0; font-size: 16px;">Unfortunately, your venue inquiry for <strong>${venue.name}</strong> could not be accommodated at this time.</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              We understand this may be disappointing. The venue owner was unable to accommodate your request for the specified date and requirements.
            </p>

            <!-- Inquiry Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Your Inquiry Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || "None specified"}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Alternative Options -->
            <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #234e52; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Alternative Options</h3>
              <ul style="color: #285e61; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li style="margin: 8px 0;"><strong>Browse alternative venues</strong> - We have many other excellent venues that might suit your needs</li>
                <li style="margin: 8px 0;"><strong>Try different dates</strong> - The venue might be available on alternative dates</li>
                <li style="margin: 8px 0;"><strong>Contact our support team</strong> - We can help you find suitable alternatives</li>
                <li style="margin: 8px 0;"><strong>Modify requirements</strong> - Consider adjusting guest count or other specifications</li>
              </ul>
            </div>

            <!-- Browse More Venues CTA -->
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f7fafc; border-radius: 6px;">
              <p style="color: #4a5568; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Don't let this setback stop your perfect event. Let us help you find another excellent venue.
              </p>
              <a href="${process.env.FRONTEND_URL || "https://venuekart.com"}/venues" style="background: linear-gradient(135deg, #3C3B6E 0%, #6C63FF 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Browse Other Venues
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              We're committed to helping you find the perfect venue for your event.
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${(/* @__PURE__ */ new Date()).getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry rejection email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending inquiry rejection email to customer:", error);
    return false;
  }
}
const router$5 = expressExports.Router();
router$5.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const scope = "openid email profile";
  if (!clientId) return res.status(500).send("Missing GOOGLE_CLIENT_ID");
  if (!redirectUri) return res.status(500).send("Missing GOOGLE_REDIRECT_URI");
  const requestedUserType = req.query.userType || "customer";
  const userType = ["customer", "venue-owner"].includes(requestedUserType) ? requestedUserType : "customer";
  console.log(`Google OAuth initiated with userType: ${userType} (requested: ${requestedUserType})`);
  console.log(`Using redirectUri: ${redirectUri}`);
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&access_type=offline&prompt=consent&state=${encodeURIComponent(JSON.stringify({ userType }))}`;
  return res.redirect(authUrl);
});
router$5.get("/google/callback", async (req, res) => {
  try {
    const { code, error, state } = req.query;
    let userType = "customer";
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        const requestedUserType = stateData.userType || "customer";
        userType = ["customer", "venue-owner"].includes(requestedUserType) ? requestedUserType : "customer";
        console.log(`Google OAuth callback - userType from state: ${userType} (requested: ${requestedUserType})`);
      } catch (parseError) {
        console.log("Could not parse state parameter:", parseError);
      }
    } else {
      console.log("No state parameter received, using default userType: customer");
    }
    if (error || !code) {
      return res.send(`
        <script>
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'oauth_failed'
              }, '${process.env.CLIENT_URL}');
              setTimeout(() => window.close(), 100);
            } catch (error) {
              window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed';
            }
          } else {
            window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed';
          }
        <\/script>
      `);
    }
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
      })
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokens);
      return res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);
    }
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
    const googleUser = await userResponse.json();
    if (!userResponse.ok) {
      console.error("Failed to get user info:", googleUser);
      return res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);
    }
    let [userRows] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [googleUser.email]
    );
    let user;
    if (userRows.length === 0) {
      console.log(`Creating new user via Google OAuth with userType: ${userType} for email: ${googleUser.email}`);
      const [result] = await pool.execute(
        "INSERT INTO users (google_id, email, name, profile_picture, user_type, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
        [googleUser.id, googleUser.email, googleUser.name, googleUser.picture, userType, true]
      );
      user = {
        id: result.insertId,
        google_id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        profile_picture: googleUser.picture,
        user_type: userType,
        is_verified: true
      };
    } else {
      user = userRows[0];
      if (!user.google_id) {
        await pool.execute(
          "UPDATE users SET google_id = ?, profile_picture = ?, is_verified = true WHERE id = ?",
          [googleUser.id, googleUser.picture, user.id]
        );
        user.google_id = googleUser.id;
        user.profile_picture = googleUser.picture;
        user.is_verified = true;
      }
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await pool.execute(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, refreshToken, expiresAt]
    );
    res.send(`
      <script>
        console.log('Google auth callback successful');

        // Store tokens in parent window
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              accessToken: '${accessToken}',
              refreshToken: '${refreshToken}'
            }, '${process.env.CLIENT_URL}');

            // Give a moment for message to be processed
            setTimeout(() => {
              window.close();
            }, 100);
          } catch (error) {
            console.error('Error posting message to parent:', error);
            // Fallback: redirect normally
            window.location.href = '${process.env.CLIENT_URL}/?access_token=${accessToken}&refresh_token=${refreshToken}';
          }
        } else {
          // Fallback: redirect normally if not in popup
          window.location.href = '${process.env.CLIENT_URL}/?access_token=${accessToken}&refresh_token=${refreshToken}';
        }
      <\/script>
    `);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.send(`
      <script>
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'oauth_failed'
            }, '${process.env.CLIENT_URL}');
            setTimeout(() => window.close(), 100);
          } catch (error) {
            window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed';
          }
        } else {
          window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed';
        }
      <\/script>
    `);
  }
});
router$5.post("/register", async (req, res) => {
  try {
    console.log("Registration request received:", {
      body: { ...req.body, password: req.body.password ? "[PROVIDED]" : null },
      headers: req.headers["content-type"]
    });
    const { email, name, userType = "customer", password = null, mobileNumber = null } = req.body;
    console.log("Extracted data:", { email, name, userType, password: password ? "[PROVIDED]" : null, mobileNumber });
    if (!email || !name) {
      console.log("Validation failed: Email or name missing");
      return res.status(400).json({ error: "Email and name are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Validation failed: Invalid email format");
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (!["customer", "venue-owner"].includes(userType)) {
      console.log("Validation failed: Invalid user type:", userType);
      return res.status(400).json({ error: "Invalid user type" });
    }
    if (userType === "venue-owner" && !password) {
      console.log("Validation failed: Password required for venue owner");
      return res.status(400).json({ error: "Password is required for venue owners" });
    }
    if (password && password.length < 6) {
      console.log("Validation failed: Password too short");
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    if (mobileNumber && !/^[0-9]{10}$/.test(mobileNumber.replace(/\s+/g, ""))) {
      console.log("Validation failed: Invalid mobile number");
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number" });
    }
    console.log("All validations passed, proceeding with registration");
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      if (existingUsers[0].is_verified) {
        return res.status(400).json({ error: "Email is already registered" });
      } else {
        await pool.execute("DELETE FROM users WHERE email = ? AND is_verified = FALSE", [email]);
      }
    }
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    const [result] = await pool.execute(
      "INSERT INTO users (email, name, password_hash, mobile_number, user_type, is_verified) VALUES (?, ?, ?, ?, ?, FALSE)",
      [email, name, passwordHash, mobileNumber, userType]
    );
    await pool.execute("DELETE FROM otp_verifications WHERE email = ?", [email]);
    await pool.execute(
      "INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );
    console.log("Attempting to send OTP email...");
    const emailSent = await sendOTPEmail(email, otp, name, "Account Verification");
    console.log("Email sent result:", emailSent);
    if (!emailSent) {
      console.log("Email sending failed, but continuing with registration for debugging...");
      console.log("In production, this would clean up and return an error");
    }
    console.log("Registration completed successfully");
    res.status(201).json({
      message: "Registration successful! Please check your email for the verification code.",
      email
    });
  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});
router$5.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    const [otpRows] = await pool.execute(
      "SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email, otp]
    );
    if (otpRows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    const [userRows] = await pool.execute(
      "SELECT * FROM users WHERE email = ? AND is_verified = FALSE",
      [email]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found or already verified" });
    }
    const user = userRows[0];
    await pool.execute(
      "UPDATE users SET is_verified = TRUE WHERE id = ?",
      [user.id]
    );
    await pool.execute(
      "DELETE FROM otp_verifications WHERE email = ?",
      [email]
    );
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await pool.execute(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, refreshToken, expiresAt]
    );
    res.json({
      message: "Email verified successfully!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        profilePicture: user.profile_picture
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});
router$5.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const [userRows] = await pool.execute(
      "SELECT * FROM users WHERE email = ? AND is_verified = FALSE",
      [email]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found or already verified" });
    }
    const user = userRows[0];
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    await pool.execute("DELETE FROM otp_verifications WHERE email = ?", [email]);
    await pool.execute(
      "INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );
    const emailSent = await sendOTPEmail(email, otp, user.name, "Account Verification");
    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send verification email" });
    }
    res.json({ message: "Verification code sent successfully!" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Failed to resend verification code" });
  }
});
router$5.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await pool.execute(
        "DELETE FROM refresh_tokens WHERE token = ?",
        [refreshToken]
      );
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});
router$5.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }
    const [tokenRows] = await pool.execute(
      "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()",
      [refreshToken]
    );
    if (tokenRows.length === 0) {
      return res.status(403).json({ error: "Refresh token expired or not found" });
    }
    const [userRows] = await pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [decoded.id]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userRows[0];
    const newAccessToken = generateAccessToken(user);
    res.json({
      accessToken: newAccessToken,
      message: "Token refreshed successfully"
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});
router$5.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    try {
      await pool.execute("SELECT 1");
    } catch (dbError) {
      console.error("Database connection failed:", dbError.message);
      return res.status(503).json({
        error: "Database service unavailable. Please connect to a database service like Neon or set up MySQL."
      });
    }
    const [userRows] = await pool.execute(
      "SELECT * FROM users WHERE email = ? AND is_verified = TRUE",
      [email]
    );
    if (userRows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = userRows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: "This account uses social login. Please sign in with Google." });
    }
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await pool.execute(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, refreshToken, expiresAt]
    );
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        profilePicture: user.profile_picture
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(503).json({
        error: "Database connection failed. Please ensure database is running and credentials are correct."
      });
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "Database tables not found. Please initialize the database."
      });
    } else {
      return res.status(500).json({
        error: `Login failed: ${error.message}`
      });
    }
  }
});
router$5.get("/me", authenticateToken, async (req, res) => {
  try {
    const [userRows] = await pool.execute(
      "SELECT id, email, name, user_type, profile_picture, mobile_number, is_verified FROM users WHERE id = ?",
      [req.user.id]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userRows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.user_type,
      profilePicture: user.profile_picture,
      mobileNumber: user.mobile_number,
      isVerified: user.is_verified
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
});
router$5.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const [userRows] = await pool.execute(
      "SELECT * FROM users WHERE email = ? AND is_verified = TRUE",
      [email]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ error: "Email doesn't exist in our records" });
    }
    const user = userRows[0];
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    await pool.execute("DELETE FROM otp_verifications WHERE email = ?", [email]);
    await pool.execute(
      "INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );
    const emailSent = await sendOTPEmail(email, otp, user.name, "Password Reset");
    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send reset email" });
    }
    res.json({ message: "Password reset code sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});
router$5.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    const [otpRows] = await pool.execute(
      "SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email, otp]
    );
    if (otpRows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.execute(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [passwordHash, email]
    );
    await pool.execute(
      "DELETE FROM otp_verifications WHERE email = ?",
      [email]
    );
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});
router$5.post("/verify-email-update", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    const [otpRows] = await pool.execute(
      "SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email, otp]
    );
    if (otpRows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    const pendingData = JSON.parse(otpRows[0].pending_data);
    const { userId, name, mobileNumber, password } = pendingData;
    let updateFields = ["name = ?", "email = ?"];
    let updateValues = [name, email];
    if (mobileNumber) {
      updateFields.push("mobile_number = ?");
      updateValues.push(mobileNumber);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);
      updateFields.push("password_hash = ?");
      updateValues.push(passwordHash);
    }
    updateValues.push(userId);
    await pool.execute(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );
    await pool.execute(
      "DELETE FROM otp_verifications WHERE email = ?",
      [email]
    );
    const [updatedUserRows] = await pool.execute(
      "SELECT id, email, name, user_type, profile_picture, mobile_number, is_verified FROM users WHERE id = ?",
      [userId]
    );
    const updatedUser = updatedUserRows[0];
    res.json({
      message: "Email verified and profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        userType: updatedUser.user_type,
        profilePicture: updatedUser.profile_picture,
        mobileNumber: updatedUser.mobile_number,
        isVerified: updatedUser.is_verified
      }
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Failed to verify email update" });
  }
});
router$5.put("/update-profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, mobileNumber, password } = req.body;
    const userId = req.user.id;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (mobileNumber && !/^[0-9]{10}$/.test(mobileNumber.replace(/\s+/g, ""))) {
      return res.status(400).json({ error: "Invalid mobile number format" });
    }
    const [currentUserRows] = await pool.execute(
      "SELECT email FROM users WHERE id = ?",
      [userId]
    );
    const currentEmail = currentUserRows[0].email;
    const emailChanged = email !== currentEmail;
    if (emailChanged) {
      const [existingUser] = await pool.execute(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId]
      );
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "Email is already taken by another user" });
      }
    }
    if (emailChanged) {
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await pool.execute("DELETE FROM otp_verifications WHERE email = ?", [email]);
      await pool.execute(
        "INSERT INTO otp_verifications (email, otp, expires_at, pending_data) VALUES (?, ?, ?, ?)",
        [email, otp, expiresAt, JSON.stringify({ userId, name, email, mobileNumber, password })]
      );
      const emailSent = await sendOTPEmail(email, otp, name, "Email Update Verification");
      if (!emailSent) {
        return res.status(500).json({ error: "Failed to send verification email" });
      }
      return res.json({
        requiresVerification: true,
        newEmail: email,
        message: "Verification code sent to your new email address"
      });
    }
    let updateFields = ["name = ?"];
    let updateValues = [name];
    if (mobileNumber) {
      updateFields.push("mobile_number = ?");
      updateValues.push(mobileNumber);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);
      updateFields.push("password_hash = ?");
      updateValues.push(passwordHash);
    }
    updateValues.push(userId);
    await pool.execute(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
const router$4 = expressExports.Router();
router$4.get("/filter-options", async (req, res) => {
  var _a, _b, _c, _d;
  try {
    console.log("Fetching filter options from uploaded venues...");
    const [venueTypes] = await pool.execute(`
      SELECT DISTINCT type
      FROM venues
      WHERE status = 'active' AND type IS NOT NULL AND type != ''
      ORDER BY type
    `);
    const [locations] = await pool.execute(`
      SELECT DISTINCT location
      FROM venues
      WHERE status = 'active' AND location IS NOT NULL AND location != ''
      ORDER BY location
    `);
    const [priceRange] = await pool.execute(`
      SELECT
        MIN(COALESCE(price_min, price_per_day)) as min_price,
        MAX(COALESCE(price_max, price_per_day)) as max_price
      FROM venues
      WHERE status = 'active'
    `);
    const [capacityRange] = await pool.execute(`
      SELECT
        MIN(capacity) as min_capacity,
        MAX(capacity) as max_capacity
      FROM venues
      WHERE status = 'active'
    `);
    const filterOptions = {
      venueTypes: venueTypes.map((row) => row.type).filter((type) => type && type.trim()),
      locations: locations.map((row) => row.location).filter((location) => location && location.trim()),
      priceRange: {
        min: ((_a = priceRange[0]) == null ? void 0 : _a.min_price) || 0,
        max: ((_b = priceRange[0]) == null ? void 0 : _b.max_price) || 5e5
      },
      capacityRange: {
        min: ((_c = capacityRange[0]) == null ? void 0 : _c.min_capacity) || 0,
        max: ((_d = capacityRange[0]) == null ? void 0 : _d.max_capacity) || 5e3
      }
    };
    console.log("Filter options:", filterOptions);
    res.json(filterOptions);
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ error: "Failed to fetch filter options" });
  }
});
router$4.get("/", async (req, res) => {
  try {
    const { location, search, type, limit = 20, offset = 0, page = 1 } = req.query;
    const limitInt = parseInt(limit);
    const offsetInt = page ? (parseInt(page) - 1) * limitInt : parseInt(offset);
    console.log("Venues API called with params:", { location, search, type, limit: limitInt, offset: offsetInt, page });
    let whereConditions = "v.status = 'active'";
    const params = [];
    const countParams = [];
    if (location && location.trim() !== "") {
      whereConditions += " AND LOWER(v.location) LIKE LOWER(?)";
      params.push(`%${location}%`);
      countParams.push(`%${location}%`);
    }
    if (type && type.trim() !== "") {
      whereConditions += " AND LOWER(v.type) LIKE LOWER(?)";
      params.push(`%${type}%`);
      countParams.push(`%${type}%`);
    }
    if (search && search.trim() !== "") {
      whereConditions += " AND (LOWER(v.name) LIKE LOWER(?) OR LOWER(v.description) LIKE LOWER(?))";
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }
    let totalCount = 0;
    let venues = [];
    try {
      const countQuery = `
        SELECT COUNT(DISTINCT v.id) as total
        FROM venues v
        LEFT JOIN users u ON v.owner_id = u.id
        WHERE ${whereConditions}
      `;
      console.log("Executing count query:", countQuery);
      console.log("With count params:", countParams);
      const [countResult] = await pool.execute(countQuery, countParams);
      totalCount = countResult[0].total;
      console.log("Total venues count:", totalCount);
      const dataQuery = `
        SELECT v.*, u.name as owner_name, u.mobile_number as owner_phone,
               GROUP_CONCAT(DISTINCT vi.image_url) as images,
               GROUP_CONCAT(DISTINCT vf.facility_name) as facilities
        FROM venues v
        LEFT JOIN users u ON v.owner_id = u.id
        LEFT JOIN venue_images vi ON v.id = vi.venue_id
        LEFT JOIN venue_facilities vf ON v.id = vf.venue_id
        WHERE ${whereConditions}
        GROUP BY v.id
        ORDER BY v.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const dataParams = [...params, limitInt, offsetInt];
      console.log("Executing data query:", dataQuery);
      console.log("With data params:", dataParams);
      [venues] = await pool.execute(dataQuery, dataParams);
      console.log("Query returned venues count:", venues.length);
    } catch (tableError) {
      console.log("Using fallback venues query due to missing tables");
      const fallbackCountQuery = `
        SELECT COUNT(*) as total
        FROM venues v
        LEFT JOIN users u ON v.owner_id = u.id
        WHERE ${whereConditions}
      `;
      try {
        console.log("Executing fallback count query:", fallbackCountQuery);
        const [fallbackCountResult] = await pool.execute(fallbackCountQuery, countParams);
        totalCount = fallbackCountResult[0].total;
        console.log("Fallback total count:", totalCount);
      } catch (countError) {
        console.log("Count query failed, setting total to 0:", countError.message);
        totalCount = 0;
      }
      const fallbackDataQuery = `
        SELECT v.*, u.name as owner_name, u.mobile_number as owner_phone
        FROM venues v
        LEFT JOIN users u ON v.owner_id = u.id
        WHERE ${whereConditions}
        ORDER BY v.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const fallbackDataParams = [...params, limitInt, offsetInt];
      try {
        console.log("Executing fallback data query:", fallbackDataQuery);
        console.log("With fallback data params:", fallbackDataParams);
        [venues] = await pool.execute(fallbackDataQuery, fallbackDataParams);
        console.log("Fallback query returned venues count:", venues.length);
      } catch (fallbackError) {
        console.log("No venues table found, returning empty response. Error:", fallbackError.message);
        return res.json({
          venues: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalCount: 0,
            limit: limitInt,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      }
    }
    const formattedVenues = venues.map((venue) => ({
      ...venue,
      images: venue.images ? venue.images.split(",") : [],
      facilities: venue.facilities ? venue.facilities.split(",") : [],
      price: parseFloat(venue.price_per_day),
      priceMin: venue.price_min ? parseFloat(venue.price_min) : null,
      priceMax: venue.price_max ? parseFloat(venue.price_max) : null
    }));
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(totalCount / limitInt);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
    const response2 = {
      venues: formattedVenues,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit: limitInt,
        hasNextPage,
        hasPrevPage
      }
    };
    console.log("Sending paginated response:", {
      venuesCount: formattedVenues.length,
      currentPage,
      totalPages,
      totalCount
    });
    res.json(response2);
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ error: "Failed to fetch venues" });
  }
});
router$4.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [venues] = await pool.execute(`
      SELECT v.*, u.name as owner_name, u.mobile_number as owner_phone, u.email as owner_email
      FROM venues v
      LEFT JOIN users u ON v.owner_id = u.id
      WHERE v.id = ? AND v.status = 'active'
    `, [id]);
    if (venues.length === 0) {
      return res.status(404).json({ error: "Venue not found" });
    }
    const venue = venues[0];
    const [images] = await pool.execute(
      "SELECT image_url, is_primary FROM venue_images WHERE venue_id = ? ORDER BY is_primary DESC",
      [id]
    );
    const [facilities] = await pool.execute(
      "SELECT facility_name FROM venue_facilities WHERE venue_id = ?",
      [id]
    );
    res.json({
      ...venue,
      price: parseFloat(venue.price_per_day),
      priceMin: venue.price_min ? parseFloat(venue.price_min) : null,
      priceMax: venue.price_max ? parseFloat(venue.price_max) : null,
      images: images.map((img) => img.image_url),
      facilities: facilities.map((f) => f.facility_name)
    });
  } catch (error) {
    console.error("Error fetching venue:", error);
    res.status(500).json({ error: "Failed to fetch venue" });
  }
});
router$4.get("/owner/my-venues", authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const [venues] = await pool.execute(`
      SELECT v.*, 
             GROUP_CONCAT(DISTINCT vi.image_url) as images,
             GROUP_CONCAT(DISTINCT vf.facility_name) as facilities,
             COUNT(DISTINCT b.id) as booking_count,
             COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.amount ELSE 0 END), 0) as total_revenue
      FROM venues v
      LEFT JOIN venue_images vi ON v.id = vi.venue_id
      LEFT JOIN venue_facilities vf ON v.id = vf.venue_id
      LEFT JOIN bookings b ON v.id = b.venue_id
      WHERE v.owner_id = ?
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `, [ownerId]);
    const formattedVenues = venues.map((venue) => ({
      ...venue,
      images: venue.images ? venue.images.split(",") : [],
      facilities: venue.facilities ? venue.facilities.split(",") : [],
      price: parseFloat(venue.price_per_day),
      priceMin: venue.price_min ? parseFloat(venue.price_min) : null,
      priceMax: venue.price_max ? parseFloat(venue.price_max) : null,
      total_revenue: parseFloat(venue.total_revenue)
    }));
    res.json(formattedVenues);
  } catch (error) {
    console.error("Error fetching owner venues:", error);
    res.status(500).json({ error: "Failed to fetch venues" });
  }
});
router$4.post("/", authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { venueName, description, location, footfall, price, priceMin, priceMax, images, facilities, venueType } = req.body;
    let finalPriceMin, finalPriceMax;
    if (price !== void 0) {
      finalPriceMin = parseInt(price);
      finalPriceMax = parseInt(price);
    } else if (priceMin !== void 0 && priceMax !== void 0) {
      finalPriceMin = parseInt(priceMin);
      finalPriceMax = parseInt(priceMax);
    } else {
      return res.status(400).json({ error: "Required fields: venueName, description, location, footfall, price (or priceMin/priceMax)" });
    }
    console.log("Received venue creation request:", {
      ownerId,
      venueName,
      description,
      location,
      footfall,
      price,
      priceMin,
      priceMax,
      finalPriceMin,
      finalPriceMax,
      imageCount: Array.isArray(images) ? images.length : 0,
      facilityCount: Array.isArray(facilities) ? facilities.length : 0
    });
    if (!venueName || !description || !location || !footfall) {
      return res.status(400).json({ error: "Required fields: venueName, description, location, footfall, price" });
    }
    if (parseInt(footfall) <= 0) {
      return res.status(400).json({ error: "Footfall capacity must be greater than 0" });
    }
    if (finalPriceMin <= 0 || finalPriceMax <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0" });
    }
    if (finalPriceMin > finalPriceMax) {
      return res.status(400).json({ error: "Maximum price must be greater than or equal to minimum price" });
    }
    const imageUrls = Array.isArray(images) ? images.filter((img) => img && img.trim()) : [];
    const facilityList = Array.isArray(facilities) ? facilities.filter((f) => f && f.trim()) : [];
    try {
      await pool.execute("SELECT 1");
    } catch (dbError) {
      console.error("Database connection failed:", dbError.message);
      return res.status(503).json({
        error: "Database service unavailable. Please connect to a database service like Neon or set up MySQL."
      });
    }
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const averagePrice = (finalPriceMin + finalPriceMax) / 2;
      const venueTypeValue = venueType && venueType.trim() ? venueType : "Venue";
      const [venueResult] = await connection.execute(`
        INSERT INTO venues (owner_id, name, description, type, location, capacity, price_per_day, price_min, price_max)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [ownerId, venueName, description, venueTypeValue, location, parseInt(footfall), averagePrice, finalPriceMin, finalPriceMax]);
      const venueId = venueResult.insertId;
      if (imageUrls.length > 0) {
        for (let i = 0; i < imageUrls.length; i++) {
          await connection.execute(`
            INSERT INTO venue_images (venue_id, image_url, is_primary)
            VALUES (?, ?, ?)
          `, [venueId, imageUrls[i], i === 0]);
        }
      }
      if (facilityList.length > 0) {
        for (const facility of facilityList) {
          await connection.execute(`
            INSERT INTO venue_facilities (venue_id, facility_name)
            VALUES (?, ?)
          `, [venueId, facility]);
        }
      }
      await connection.commit();
      console.log("Venue created successfully with ID:", venueId);
      res.status(201).json({
        message: "Venue created successfully",
        venueId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating venue:", error);
    if (error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(503).json({
        error: "Database connection failed. Please ensure database is running and credentials are correct."
      });
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        error: "Database tables not found. Please initialize the database."
      });
    } else {
      return res.status(500).json({
        error: `Failed to create venue: ${error.message}`
      });
    }
  }
});
router$4.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { venueName, description, location, footfall, price, priceMin, priceMax, images, facilities, venueType } = req.body;
    let finalPriceMin, finalPriceMax;
    if (price !== void 0) {
      finalPriceMin = parseInt(price);
      finalPriceMax = parseInt(price);
    } else if (priceMin !== void 0 && priceMax !== void 0) {
      finalPriceMin = parseInt(priceMin);
      finalPriceMax = parseInt(priceMax);
    } else {
      finalPriceMin = null;
      finalPriceMax = null;
    }
    const [venues] = await pool.execute(
      "SELECT * FROM venues WHERE id = ? AND owner_id = ?",
      [id, ownerId]
    );
    if (venues.length === 0) {
      return res.status(404).json({ error: "Venue not found or access denied" });
    }
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const averagePrice = finalPriceMin && finalPriceMax ? (finalPriceMin + finalPriceMax) / 2 : null;
      const venueTypeValue = venueType && venueType.trim() ? venueType : null;
      await connection.execute(`
        UPDATE venues
        SET name = ?, description = ?, type = COALESCE(?, type), location = ?, capacity = ?, price_per_day = ?, price_min = ?, price_max = ?
        WHERE id = ?
      `, [venueName, description, venueTypeValue, location, footfall, averagePrice, finalPriceMin, finalPriceMax, id]);
      await connection.execute("DELETE FROM venue_images WHERE venue_id = ?", [id]);
      await connection.execute("DELETE FROM venue_facilities WHERE venue_id = ?", [id]);
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await connection.execute(`
            INSERT INTO venue_images (venue_id, image_url, is_primary)
            VALUES (?, ?, ?)
          `, [id, images[i], i === 0]);
        }
      }
      if (facilities && facilities.length > 0) {
        for (const facility of facilities) {
          if (facility.trim()) {
            await connection.execute(`
              INSERT INTO venue_facilities (venue_id, facility_name)
              VALUES (?, ?)
            `, [id, facility.trim()]);
          }
        }
      }
      await connection.commit();
      res.json({ message: "Venue updated successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating venue:", error);
    res.status(500).json({ error: "Failed to update venue" });
  }
});
router$4.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const [venues] = await pool.execute(
      "SELECT * FROM venues WHERE id = ? AND owner_id = ?",
      [id, ownerId]
    );
    if (venues.length === 0) {
      return res.status(404).json({ error: "Venue not found or access denied" });
    }
    await pool.execute("DELETE FROM venues WHERE id = ?", [id]);
    res.json({ message: "Venue deleted successfully" });
  } catch (error) {
    console.error("Error deleting venue:", error);
    res.status(500).json({ error: "Failed to delete venue" });
  }
});
router$4.get("/owner/dashboard-stats", authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const [venueCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM venues WHERE owner_id = ?",
      [ownerId]
    );
    const [bookingStats] = await pool.execute(`
      SELECT 
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bookings
      FROM venues v
      LEFT JOIN bookings b ON v.id = b.venue_id
      WHERE v.owner_id = ?
    `, [ownerId]);
    const [activeVenues] = await pool.execute(
      'SELECT COUNT(*) as count FROM venues WHERE owner_id = ? AND status = "active"',
      [ownerId]
    );
    res.json({
      totalVenues: venueCount[0].count,
      activeVenues: activeVenues[0].count,
      totalBookings: bookingStats[0].total_bookings,
      pendingBookings: bookingStats[0].pending_bookings,
      totalRevenue: parseFloat(bookingStats[0].total_revenue)
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});
const router$3 = expressExports.Router();
router$3.get("/owner", authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;
    let query2 = `
      SELECT b.*, v.name as venue_name, v.location as venue_location
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE v.owner_id = ?
    `;
    const params = [ownerId];
    if (status) {
      query2 += " AND b.status = ?";
      params.push(status);
    }
    query2 += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));
    const [bookings] = await pool.execute(query2, params);
    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      amount: parseFloat(booking.amount),
      payment_amount: parseFloat(booking.payment_amount || booking.amount)
    }));
    res.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});
router$3.get("/customer", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    const [bookings] = await pool.execute(`
      SELECT b.*, v.name as venue_name, v.location as venue_location,
             u.name as owner_name, u.mobile_number as owner_phone
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      JOIN users u ON v.owner_id = u.id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [customerId, parseInt(limit), parseInt(offset)]);
    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      amount: parseFloat(booking.amount),
      payment_amount: parseFloat(booking.payment_amount || booking.amount)
    }));
    res.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});
router$3.post("/", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      venueId,
      eventDate,
      eventType,
      guestCount,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      specialRequirements
    } = req.body;
    if (!venueId || !eventDate || !guestCount || !amount || !customerName || !customerEmail) {
      return res.status(400).json({ error: "Required fields missing" });
    }
    const [venues] = await pool.execute(
      'SELECT * FROM venues WHERE id = ? AND status = "active"',
      [venueId]
    );
    if (venues.length === 0) {
      return res.status(404).json({ error: "Venue not found or inactive" });
    }
    const venue = venues[0];
    if (guestCount > venue.capacity) {
      return res.status(400).json({
        error: `Guest count exceeds venue capacity (${venue.capacity})`
      });
    }
    const [existingBookings] = await pool.execute(`
      SELECT * FROM bookings 
      WHERE venue_id = ? AND event_date = ? AND status = 'confirmed'
    `, [venueId, eventDate]);
    if (existingBookings.length > 0) {
      return res.status(400).json({ error: "Venue is not available on this date" });
    }
    const GST_RATE = 0.18;
    const payment_amount = Math.round(venue.price_per_day * (1 + GST_RATE));
    const [result] = await pool.execute(`
      INSERT INTO bookings (
        venue_id, customer_id, customer_name, customer_email, customer_phone,
        event_date, event_type, guest_count, amount, payment_amount, special_requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      venueId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      eventType,
      guestCount,
      amount,
      payment_amount,
      specialRequirements
    ]);
    res.status(201).json({
      message: "Booking created successfully",
      bookingId: result.insertId
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});
router$3.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = req.user.id;
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const [bookings] = await pool.execute(`
      SELECT b.*, v.owner_id, v.name as venue_name, v.location as venue_location
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE b.id = ? AND v.owner_id = ?
    `, [id, ownerId]);
    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found or access denied" });
    }
    const booking = bookings[0];
    const previousStatus = booking.status;
    let paymentStatus = "not_required";
    if (status === "confirmed") {
      paymentStatus = "pending";
    }
    await pool.execute(
      "UPDATE bookings SET status = ?, payment_status = ? WHERE id = ?",
      [status, paymentStatus, id]
    );
    if (status === "confirmed") {
      await pool.execute(
        "UPDATE venues SET total_bookings = total_bookings + 1 WHERE id = ?",
        [booking.venue_id]
      );
    }
    if (previousStatus === "pending" && (status === "confirmed" || status === "cancelled")) {
      const [ownerDetails] = await pool.execute(
        "SELECT name, email, mobile_number FROM users WHERE id = (SELECT owner_id FROM venues WHERE id = ?)",
        [booking.venue_id]
      );
      const owner = ownerDetails[0] || {};
      const baseInquiryData = {
        venue: {
          id: booking.venue_id,
          name: booking.venue_name,
          location: booking.venue_location,
          price: booking.amount
          // Using the booking amount as price reference
        },
        event: {
          date: booking.event_date,
          type: booking.event_type,
          guestCount: booking.guest_count,
          specialRequests: booking.special_requirements || "None"
        },
        owner: {
          name: owner.name || "Venue Owner",
          email: owner.email || "Not provided",
          phone: owner.mobile_number || "Not provided"
        }
      };
      if (status === "confirmed") {
        try {
          const adminInquiryData = {
            ...baseInquiryData,
            customer: {
              name: booking.customer_name,
              email: booking.customer_email,
              phone: booking.customer_phone
            }
          };
          await sendInquiryAcceptedToAdmin(adminInquiryData);
          console.log(`Inquiry acceptance notification sent to admin for booking ${id} (full customer details)`);
          const customerInquiryData = {
            ...baseInquiryData,
            customer: {
              name: booking.customer_name,
              email: booking.customer_email,
              phone: booking.customer_phone
            }
          };
          await sendInquiryAcceptedToCustomer(booking.customer_email, customerInquiryData);
          console.log(`Inquiry acceptance email sent to ${booking.customer_email} for booking ${id}`);
        } catch (emailError) {
          console.error("Error sending inquiry acceptance emails:", emailError);
        }
      } else if (status === "cancelled") {
        try {
          const adminInquiryData = {
            ...baseInquiryData,
            customer: {
              name: booking.customer_name,
              email: booking.customer_email,
              phone: booking.customer_phone
            }
          };
          await sendInquiryRejectedToAdmin(adminInquiryData);
          console.log(`Inquiry rejection notification sent to admin for booking ${id} (full customer details)`);
          const customerInquiryData = {
            ...baseInquiryData,
            customer: {
              name: booking.customer_name,
              email: booking.customer_email,
              phone: booking.customer_phone
            }
          };
          await sendInquiryRejectedToCustomer(booking.customer_email, customerInquiryData);
          console.log(`Inquiry rejection email sent to ${booking.customer_email} for booking ${id}`);
        } catch (emailError) {
          console.error("Error sending inquiry rejection emails:", emailError);
        }
      }
    }
    res.json({
      message: "Booking status updated successfully",
      emailSent: previousStatus === "pending" && (status === "confirmed" || status === "cancelled")
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});
router$3.get("/owner/recent", authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { limit = 5 } = req.query;
    const [bookings] = await pool.execute(`
      SELECT b.*, v.name as venue_name
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE v.owner_id = ?
      ORDER BY b.created_at DESC
      LIMIT ?
    `, [ownerId, parseInt(limit)]);
    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      amount: parseFloat(booking.amount),
      payment_amount: parseFloat(booking.payment_amount || booking.amount)
    }));
    res.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    res.status(500).json({ error: "Failed to fetch recent bookings" });
  }
});
router$3.get("/owner/inquiry-count", authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const [pendingBookings] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE v.owner_id = ? AND b.status = 'pending'
    `, [ownerId]);
    res.json({
      inquiryCount: pendingBookings[0].count || 0,
      pendingBookings: pendingBookings[0].count || 0
    });
  } catch (error) {
    console.error("Error fetching inquiry count:", error);
    res.status(500).json({ error: "Failed to fetch inquiry count" });
  }
});
router$3.get("/owner/inquiries", authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { limit = 20 } = req.query;
    const [inquiries] = await pool.execute(`
      SELECT b.*, v.name as venue_name, v.location as venue_location
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE v.owner_id = ? AND b.status = 'pending'
      ORDER BY b.created_at DESC
      LIMIT ?
    `, [ownerId, parseInt(limit)]);
    const formattedInquiries = inquiries.map((inquiry) => ({
      ...inquiry,
      amount: parseFloat(inquiry.amount),
      payment_amount: parseFloat(inquiry.payment_amount || inquiry.amount)
    }));
    res.json(formattedInquiries);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});
router$3.post("/inquiry", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      venue_id,
      venue_name,
      user_details,
      event_date,
      venue_owner
    } = req.body;
    if (!venue_id || !venue_name || !user_details || !event_date) {
      return res.status(400).json({ error: "Required fields missing" });
    }
    const { fullName, email, phone, eventType, guestCount } = user_details;
    if (!fullName || !email || !phone || !eventType || !guestCount) {
      return res.status(400).json({ error: "User details incomplete" });
    }
    const [venues] = await pool.execute(
      "SELECT * FROM venues WHERE id = ?",
      [venue_id]
    );
    if (venues.length === 0) {
      return res.status(404).json({ error: "Venue not found" });
    }
    const venue = venues[0];
    const estimatedAmount = venue.price_per_day || venue.price_min || 5e4;
    const GST_RATE = 0.18;
    const basePrice = venue.price_per_day || venue.price_min || 5e4;
    const payment_amount = Math.round(basePrice * (1 + GST_RATE));
    try {
      const [bookingResult] = await pool.execute(`
        INSERT INTO bookings (
          venue_id, customer_id, customer_name, customer_email, customer_phone,
          event_date, event_type, guest_count, amount, payment_amount, special_requirements, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        venue_id,
        customerId,
        fullName,
        email,
        phone,
        event_date,
        eventType,
        guestCount,
        estimatedAmount,
        payment_amount,
        user_details.specialRequests || null
      ]);
      console.log("Booking/inquiry record created with ID:", bookingResult.insertId);
    } catch (dbError) {
      console.error("Error creating booking record:", dbError);
    }
    const baseInquiryData = {
      venue: {
        id: venue_id,
        name: venue_name,
        location: venue.location || "Location not specified",
        price: venue.price_per_day || venue.price || "Price not specified"
      },
      event: {
        type: eventType,
        date: event_date,
        guestCount,
        specialRequests: user_details.specialRequests || "None"
      },
      owner: venue_owner || {
        name: "Venue Owner",
        email: "owner@venue.com"
      }
    };
    try {
      if (venue_owner && venue_owner.email) {
        const venueOwnerInquiryData = {
          ...baseInquiryData,
          customer: {
            name: fullName
            // NO email and phone for venue owner
          }
        };
        await sendVenueInquiryEmail(venue_owner.email, venueOwnerInquiryData);
        console.log(`Venue owner inquiry email sent to ${venue_owner.email} (customer contact hidden)`);
      } else {
        console.warn("Venue owner email not provided - skipping venue owner notification");
      }
      const adminInquiryData = {
        ...baseInquiryData,
        customer: {
          name: fullName,
          email,
          phone
        }
      };
      await sendInquiryNotificationToVenueKart(adminInquiryData);
      console.log("VenueKart admin inquiry notification sent (full customer details included)");
    } catch (emailError) {
      console.error("Error sending inquiry emails:", emailError);
    }
    res.status(201).json({
      message: "Inquiry sent successfully! The venue owner and our team have been notified.",
      inquiryId: Date.now()
      // Use timestamp as fallback ID
    });
  } catch (error) {
    console.error("Error processing venue inquiry:", error);
    res.status(500).json({ error: "Failed to process inquiry" });
  }
});
router$3.get("/customer/notifications", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const [notifications] = await pool.execute(`
      SELECT
        b.id,
        b.venue_id,
        v.name as venue_name,
        b.event_date,
        b.guest_count,
        b.amount,
        b.status,
        b.updated_at,
        'inquiry_status' as notification_type,
        CASE
          WHEN b.status = 'confirmed' THEN CONCAT('Your inquiry for ', v.name, ' has been accepted!')
          WHEN b.status = 'cancelled' THEN CONCAT('Your inquiry for ', v.name, ' has been declined.')
          ELSE CONCAT('Your inquiry for ', v.name, ' is pending review.')
        END as message
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE b.customer_id = ?
        AND b.updated_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY b.updated_at DESC
      LIMIT 10
    `, [customerId]);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching customer notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});
router$3.get("/customer/notification-count", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as unread_count
      FROM bookings
      WHERE customer_id = ?
        AND status IN ('confirmed', 'cancelled')
        AND updated_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
    `, [customerId]);
    res.json({ unreadCount: countResult[0].unread_count });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    res.status(500).json({ error: "Failed to fetch notification count" });
  }
});
dotenv.config();
const validateCloudinaryConfig = () => {
  const required = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`⚠️  Missing Cloudinary environment variables: ${missing.join(", ")}`);
    console.warn("Image upload functionality will be disabled. Please configure Cloudinary credentials.");
    return false;
  }
  if (process.env.CLOUDINARY_API_KEY === "demo_key" || process.env.CLOUDINARY_CLOUD_NAME === "demo" || process.env.CLOUDINARY_API_SECRET === "demo_secret") {
    console.warn("⚠️  Using demo Cloudinary credentials. Image upload will fail.");
    console.warn("Please set valid Cloudinary credentials to enable image uploads.");
    return false;
  }
  return true;
};
const isCloudinaryConfigured = validateCloudinaryConfig();
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
async function uploadImage(imageData, folder = "venuekart", publicId = null) {
  if (!isCloudinaryConfigured) {
    console.log("📸 Cloudinary not configured, returning mock image URL");
    return {
      url: "https://via.placeholder.com/800x600/6C63FF/FFFFFF?text=Image+Upload+Disabled",
      publicId: `mock_${Date.now()}`,
      width: 800,
      height: 600,
      format: "jpg"
    };
  }
  try {
    const uploadOptions = {
      folder,
      resource_type: "auto",
      quality: "auto:low",
      // Reduced quality for faster upload
      fetch_format: "auto",
      transformation: [
        {
          width: 800,
          // Reduced from 1200 for faster processing
          height: 600,
          // Reduced from 800 for faster processing
          crop: "limit"
        }
      ]
    };
    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }
    const result = await v2.uploader.upload(imageData, uploadOptions);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
}
async function deleteImage(publicId) {
  if (!isCloudinaryConfigured) {
    console.log("📸 Cloudinary not configured, simulating image deletion");
    return { result: "ok" };
  }
  try {
    const result = await v2.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
}
async function uploadMultipleImages(imageDataArray, folder = "venuekart") {
  try {
    const results = [];
    for (const imageData of imageDataArray) {
      const result = await uploadImage(imageData, folder);
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error("Multiple images upload error:", error);
    throw new Error(`Failed to upload multiple images to Cloudinary: ${error.message}`);
  }
}
const router$2 = expressExports.Router();
router$2.post("/image", authenticateToken, async (req, res) => {
  try {
    const { imageData, folder = "venuekart" } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: "Image data is required" });
    }
    if (!imageData.startsWith("data:image/")) {
      return res.status(400).json({ error: "Invalid image format. Please provide a valid base64 image." });
    }
    const result = await uploadImage(imageData, folder);
    res.json({
      message: "Image uploaded successfully",
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload image" });
  }
});
router$2.post("/images", authenticateToken, async (req, res) => {
  try {
    const { images, folder = "venuekart" } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Images array is required" });
    }
    if (images.length > 10) {
      return res.status(400).json({ error: "Maximum 10 images allowed" });
    }
    for (const imageData of images) {
      if (!imageData.startsWith("data:image/")) {
        return res.status(400).json({ error: "All images must be valid base64 format" });
      }
    }
    const results = await uploadMultipleImages(images, folder);
    res.json({
      message: "Images uploaded successfully",
      images: results.map((result) => ({
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format
      }))
    });
  } catch (error) {
    console.error("Multiple images upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload images" });
  }
});
router$2.delete("/image/:publicId", authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({ error: "Public ID is required" });
    }
    const decodedPublicId = decodeURIComponent(publicId);
    const result = await deleteImage(decodedPublicId);
    res.json({
      message: "Image deleted successfully",
      result
    });
  } catch (error) {
    console.error("Image delete error:", error);
    res.status(500).json({ error: error.message || "Failed to delete image" });
  }
});
const router$1 = expressExports.Router();
router$1.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let favorites;
    try {
      [favorites] = await pool.execute(`
        SELECT v.*, u.name as owner_name, u.mobile_number as owner_phone,
               GROUP_CONCAT(DISTINCT vi.image_url) as images,
               GROUP_CONCAT(DISTINCT vf.facility_name) as facilities
        FROM favorites f
        JOIN venues v ON f.venue_id = v.id
        LEFT JOIN users u ON v.owner_id = u.id
        LEFT JOIN venue_images vi ON v.id = vi.venue_id
        LEFT JOIN venue_facilities vf ON v.id = vf.venue_id
        WHERE f.user_id = ? AND v.status = 'active'
        GROUP BY v.id
        ORDER BY f.created_at DESC
      `, [userId]);
    } catch (tableError) {
      console.log("Favorites tables not ready, returning empty array");
      return res.json([]);
    }
    const formattedFavorites = favorites.map((venue) => ({
      ...venue,
      images: venue.images ? venue.images.split(",") : [],
      facilities: venue.facilities ? venue.facilities.split(",") : [],
      price: parseFloat(venue.price_per_day),
      priceMin: venue.price_min ? parseFloat(venue.price_min) : null,
      priceMax: venue.price_max ? parseFloat(venue.price_max) : null,
      isFavorite: true
      // Since these are from favorites table
    }));
    res.json(formattedFavorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});
router$1.post("/:venueId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { venueId } = req.params;
    const [venues] = await pool.execute(
      'SELECT id FROM venues WHERE id = ? AND status = "active"',
      [venueId]
    );
    if (venues.length === 0) {
      return res.status(404).json({ error: "Venue not found" });
    }
    await pool.execute(`
      INSERT INTO favorites (user_id, venue_id) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
    `, [userId, venueId]);
    res.json({ message: "Venue added to favorites", isFavorite: true });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ error: "Failed to add to favorites" });
  }
});
router$1.delete("/:venueId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { venueId } = req.params;
    await pool.execute(
      "DELETE FROM favorites WHERE user_id = ? AND venue_id = ?",
      [userId, venueId]
    );
    res.json({ message: "Venue removed from favorites", isFavorite: false });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ error: "Failed to remove from favorites" });
  }
});
router$1.get("/check/:venueId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { venueId } = req.params;
    const [favorites] = await pool.execute(
      "SELECT id FROM favorites WHERE user_id = ? AND venue_id = ?",
      [userId, venueId]
    );
    res.json({ isFavorite: favorites.length > 0 });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    res.status(500).json({ error: "Failed to check favorite status" });
  }
});
router$1.get("/ids", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let favorites;
    try {
      [favorites] = await pool.execute(
        "SELECT venue_id FROM favorites WHERE user_id = ?",
        [userId]
      );
    } catch (tableError) {
      console.log("Favorites table not ready, returning empty array");
      return res.json([]);
    }
    const favoriteIds = favorites.map((f) => f.venue_id);
    res.json(favoriteIds);
  } catch (error) {
    console.error("Error fetching favorite IDs:", error);
    res.status(500).json({ error: "Failed to fetch favorite IDs" });
  }
});
const router = expressExports.Router();
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}
router.post("/create-order", authenticateToken, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        error: "Payment gateway not configured. Please contact support."
      });
    }
    const { bookingId } = req.body;
    const customerId = req.user.id;
    const [bookings] = await pool.execute(`
      SELECT b.*, v.name as venue_name 
      FROM bookings b 
      JOIN venues v ON b.venue_id = v.id
      WHERE b.id = ? AND b.customer_id = ? AND b.status = 'confirmed'
    `, [bookingId, customerId]);
    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found or not confirmed" });
    }
    const booking = bookings[0];
    if (booking.razorpay_order_id) {
      return res.status(400).json({ error: "Payment order already exists for this booking" });
    }
    const paymentAmount = booking.payment_amount || booking.amount;
    const orderOptions = {
      amount: Math.round(paymentAmount * 100),
      // Convert to paisa
      currency: "INR",
      receipt: `booking_${bookingId}_${Date.now()}`,
      notes: {
        booking_id: bookingId,
        venue_name: booking.venue_name,
        customer_id: customerId,
        event_date: booking.event_date,
        display_amount: booking.amount,
        // Keep track of display amount
        payment_amount: paymentAmount
        // Actual payment amount
      }
    };
    const order = await razorpay.orders.create(orderOptions);
    await pool.execute(
      "UPDATE bookings SET razorpay_order_id = ?, payment_status = ? WHERE id = ?",
      [order.id, "pending", bookingId]
    );
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        booking_id: bookingId,
        venue_name: booking.venue_name
      },
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});
router.post("/verify-payment", authenticateToken, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        error: "Payment gateway not configured. Please contact support."
      });
    }
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id
    } = req.body;
    const customerId = req.user.id;
    const [bookings] = await pool.execute(
      "SELECT * FROM bookings WHERE id = ? AND customer_id = ? AND razorpay_order_id = ?",
      [booking_id, customerId, razorpay_order_id]
    );
    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }
    await pool.execute(`
      UPDATE bookings 
      SET payment_status = 'completed', 
          razorpay_payment_id = ?,
          payment_completed_at = NOW()
      WHERE id = ?
    `, [razorpay_payment_id, booking_id]);
    res.json({
      success: true,
      message: "Payment verified successfully",
      payment_id: razorpay_payment_id
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});
router.get("/status/:bookingId", authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const customerId = req.user.id;
    const [bookings] = await pool.execute(`
      SELECT payment_status, razorpay_order_id, razorpay_payment_id, amount, payment_completed_at
      FROM bookings 
      WHERE id = ? AND customer_id = ?
    `, [bookingId, customerId]);
    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(bookings[0]);
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
});
router.post("/payment-failed", authenticateToken, async (req, res) => {
  try {
    const { booking_id, error_description } = req.body;
    const customerId = req.user.id;
    await pool.execute(`
      UPDATE bookings 
      SET payment_status = 'failed',
          payment_error_description = ?
      WHERE id = ? AND customer_id = ?
    `, [error_description, booking_id, customerId]);
    res.json({ success: true, message: "Payment failure recorded" });
  } catch (error) {
    console.error("Error recording payment failure:", error);
    res.status(500).json({ error: "Failed to record payment failure" });
  }
});
dotenv.config();
function createServer() {
  const app2 = express();
  initializeDatabase();
  app2.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true
  }));
  app2.use(express.json());
  app2.use(express.urlencoded({ extended: true }));
  app2.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
    // Set to true in production with HTTPS
  }));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  app2.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });
  app2.get("/api/demo", handleDemo);
  app2.use("/api/auth", router$5);
  app2.use("/api/venues", router$4);
  app2.use("/api/bookings", router$3);
  app2.use("/api/upload", router$2);
  app2.use("/api/favorites", router$1);
  app2.use("/api/payments", router);
  return app2;
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function serveStatic(app2) {
  const staticDir = join(__dirname, "../spa");
  const indexPath = join(staticDir, "index.html");
  let indexTemplate;
  try {
    indexTemplate = readFileSync(indexPath, "utf-8");
  } catch (err) {
    console.warn("Could not read index.html, SPA mode disabled");
    return;
  }
  app2.use("/assets", (req, res, next) => {
    res.header("Cache-Control", "public, max-age=31536000, immutable");
    next();
  });
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    if (req.path === "/" || !req.path.includes(".")) {
      res.header("Content-Type", "text/html");
      res.send(indexTemplate);
    } else {
      next();
    }
  });
}
const app = createServer();
serveStatic(app);
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
