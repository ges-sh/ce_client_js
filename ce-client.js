// Promise polyfill
!function (e, n) { "object" == typeof exports && "undefined" != typeof module ? n() : "function" == typeof define && define.amd ? define(n) : n() }(0, function () { "use strict"; function e(n) { var t = this.constructor; return this.then(function (e) { return t.resolve(n()).then(function () { return e }) }, function (e) { return t.resolve(n()).then(function () { return t.reject(e) }) }) } var n = setTimeout; function o() { } function f(e) { if (!(this instanceof f)) throw new TypeError("Promises must be constructed via new"); if ("function" != typeof e) throw new TypeError("not a function"); this._state = 0, this._handled = !1, this._value = undefined, this._deferreds = [], l(e, this) } function r(o, r) { for (; 3 === o._state;)o = o._value; 0 !== o._state ? (o._handled = !0, f._immediateFn(function () { var e = 1 === o._state ? r.onFulfilled : r.onRejected; if (null !== e) { var n; try { n = e(o._value) } catch (t) { return void u(r.promise, t) } i(r.promise, n) } else (1 === o._state ? i : u)(r.promise, o._value) })) : o._deferreds.push(r) } function i(e, n) { try { if (n === e) throw new TypeError("A promise cannot be resolved with itself."); if (n && ("object" == typeof n || "function" == typeof n)) { var t = n.then; if (n instanceof f) return e._state = 3, e._value = n, void c(e); if ("function" == typeof t) return void l((o = t, r = n, function () { o.apply(r, arguments) }), e) } e._state = 1, e._value = n, c(e) } catch (i) { u(e, i) } var o, r } function u(e, n) { e._state = 2, e._value = n, c(e) } function c(e) { 2 === e._state && 0 === e._deferreds.length && f._immediateFn(function () { e._handled || f._unhandledRejectionFn(e._value) }); for (var n = 0, t = e._deferreds.length; n < t; n++)r(e, e._deferreds[n]); e._deferreds = null } function a(e, n, t) { this.onFulfilled = "function" == typeof e ? e : null, this.onRejected = "function" == typeof n ? n : null, this.promise = t } function l(e, n) { var t = !1; try { e(function (e) { t || (t = !0, i(n, e)) }, function (e) { t || (t = !0, u(n, e)) }) } catch (o) { if (t) return; t = !0, u(n, o) } } f.prototype["catch"] = function (e) { return this.then(null, e) }, f.prototype.then = function (e, n) { var t = new this.constructor(o); return r(this, new a(e, n, t)), t }, f.prototype["finally"] = e, f.all = function (n) { return new f(function (r, i) { if (!n || "undefined" == typeof n.length) throw new TypeError("Promise.all accepts an array"); var f = Array.prototype.slice.call(n); if (0 === f.length) return r([]); var u = f.length; function c(n, e) { try { if (e && ("object" == typeof e || "function" == typeof e)) { var t = e.then; if ("function" == typeof t) return void t.call(e, function (e) { c(n, e) }, i) } f[n] = e, 0 == --u && r(f) } catch (o) { i(o) } } for (var e = 0; e < f.length; e++)c(e, f[e]) }) }, f.resolve = function (n) { return n && "object" == typeof n && n.constructor === f ? n : new f(function (e) { e(n) }) }, f.reject = function (t) { return new f(function (e, n) { n(t) }) }, f.race = function (r) { return new f(function (e, n) { for (var t = 0, o = r.length; t < o; t++)r[t].then(e, n) }) }, f._immediateFn = "function" == typeof setImmediate && function (e) { setImmediate(e) } || function (e) { n(e, 0) }, f._unhandledRejectionFn = function (e) { void 0 !== console && console && console.warn("Possible Unhandled Promise Rejection:", e) }; var t = function () { if ("undefined" != typeof self) return self; if ("undefined" != typeof window) return window; if ("undefined" != typeof global) return global; throw Error("unable to locate global object") }(); "Promise" in t ? t.Promise.prototype["finally"] || (t.Promise.prototype["finally"] = e) : t.Promise = f });

// settings = {
//   application: [apikey],
//   sandbox: [true/false]
// }
function CEClient(settings) {

  if (!settings || !settings.application) {
    console.error('[ce-client]: Missing application parameter (API Key).');
    return;
  }

  var urls = {
    sandbox: 'https://api.sandbox.correct.email/v1/single/',
    real: 'https://api.correct.email/v1/single/'
  };

  var addParametersToUrl = function (url, parameters) {
    if (Object.keys(parameters).length === 0) { return; }
    var isFirst = true;

    function addParameters(param) {
      var value = "=" + parameters[param];
      isFirst ? url += "?" + param + value : url += "&" + param + value;
    }


    for (var param in parameters) {
      if (parameters.hasOwnProperty(param)) {
        addParameters(param);
        isFirst = false;
      }
    }

    return url;
  };

  function request(url, parameters) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', addParametersToUrl(url, parameters));

      xhr.onabort = function () {
        reject({
          status: "error",
          data: { id: 'aborted', code: 0 },
          message: 'aborted'
        });
      };

      xhr.onload = function (e) {
        const responseType = e.target.getResponseHeader('content-type');
        const rType = responseType.split(';')[0];

        switch (rType) {
          case 'application/json':
            resolve(JSON.parse(e.target.responseText));
            break;
          case 'application/octet-stream':
          case 'text/html':
            resolve({ data: e.target.responseText });
            break;
        }
      };

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status >= 400) {
          try {
            reject(JSON.parse(xhr.responseText));
          } catch (err) {
            reject({
              status: "error",
              data: { id: 'request_error', code: 1 },
              message: xhr.responseText
            });
          }
        }
      };

      xhr.send();
    });
  }

  // Send Request.
  this.check = function (parameters) {
    var url = settings.sandbox ? urls.sandbox : urls.real;
    parameters = parameters || {};
    parameters.key = settings.application;
    return request(url, parameters);
  };
}

window.CEClient = CEClient;