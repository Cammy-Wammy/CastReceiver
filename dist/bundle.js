(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var flatten = require('flat');

/*
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/*
This sample demonstrates how to build your own Receiver for use with Google
Cast.
*/

'use strict';

const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// Listen and log all Core Events
playerManager.addEventListener(cast.framework.events.category.CORE,
  event => {
    // console.log("Core event: " + event.type);
    // console.log(event);
    var flattened = flatten(event);
    newrelic.addPageAction('coreEvent', flattened);
  });

const playbackConfig = new cast.framework.PlaybackConfig();

// Set the player to start playback as soon as there are five seconds of
// media content buffered. Default is 10.
playbackConfig.autoResumeDuration = 5;

context.start();

},{"flat":2}],2:[function(require,module,exports){
var isBuffer = require('is-buffer')

module.exports = flatten
flatten.flatten = flatten
flatten.unflatten = unflatten

function flatten (target, opts) {
  opts = opts || {}

  var delimiter = opts.delimiter || '.'
  var maxDepth = opts.maxDepth
  var output = {}

  function step (object, prev, currentDepth) {
    currentDepth = currentDepth || 1
    Object.keys(object).forEach(function (key) {
      var value = object[key]
      var isarray = opts.safe && Array.isArray(value)
      var type = Object.prototype.toString.call(value)
      var isbuffer = isBuffer(value)
      var isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      )

      var newKey = prev
        ? prev + delimiter + key
        : key

      if (!isarray && !isbuffer && isobject && Object.keys(value).length &&
        (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(value, newKey, currentDepth + 1)
      }

      output[newKey] = value
    })
  }

  step(target)

  return output
}

function unflatten (target, opts) {
  opts = opts || {}

  var delimiter = opts.delimiter || '.'
  var overwrite = opts.overwrite || false
  var result = {}

  var isbuffer = isBuffer(target)
  if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
    return target
  }

  // safely ensure that the key is
  // an integer.
  function getkey (key) {
    var parsedKey = Number(key)

    return (
      isNaN(parsedKey) ||
      key.indexOf('.') !== -1 ||
      opts.object
    ) ? key
      : parsedKey
  }

  var sortedKeys = Object.keys(target).sort(function (keyA, keyB) {
    return keyA.length - keyB.length
  })

  sortedKeys.forEach(function (key) {
    var split = key.split(delimiter)
    var key1 = getkey(split.shift())
    var key2 = getkey(split[0])
    var recipient = result

    while (key2 !== undefined) {
      var type = Object.prototype.toString.call(recipient[key1])
      var isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      )

      // do not write over falsey, non-undefined values if overwrite is false
      if (!overwrite && !isobject && typeof recipient[key1] !== 'undefined') {
        return
      }

      if ((overwrite && !isobject) || (!overwrite && recipient[key1] == null)) {
        recipient[key1] = (
          typeof key2 === 'number' &&
          !opts.object ? [] : {}
        )
      }

      recipient = recipient[key1]
      if (split.length > 0) {
        key1 = getkey(split.shift())
        key2 = getkey(split[0])
      }
    }

    // unflatten again for 'messy objects'
    recipient[key1] = unflatten(target[key], opts)
  })

  return result
}

},{"is-buffer":3}],3:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

module.exports = function isBuffer (obj) {
  return obj != null && obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

},{}]},{},[1]);
