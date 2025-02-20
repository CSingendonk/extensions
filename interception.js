  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */
	  function getState() {
	    return currentState;
	  }

	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * You may call `dispatch()` from a change listener, with the following
	   * caveats:
	   *
	   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
	   * If you subscribe or unsubscribe while the listeners are being invoked, this
	   * will not have any effect on the `dispatch()` that is currently in progress.
	   * However, the next `dispatch()` call, whether nested or not, will use a more
	   * recent snapshot of the subscription list.
	   *
	   * 2. The listener should not expect to see all state changes, as the state
	   * might have been updated multiple times during a nested `dispatch()` before
	   * the listener is called. It is, however, guaranteed that all subscribers
	   * registered before the `dispatch()` started will be called with the latest
	   * state by the time it exits.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */
	  function subscribe(listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('Expected listener to be a function.');
	    }

	    var isSubscribed = true;

	    ensureCanMutateNextListeners();
	    nextListeners.push(listener);

	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }

	      isSubscribed = false;

	      ensureCanMutateNextListeners();
	      var index = nextListeners.indexOf(listener);
	      nextListeners.splice(index, 1);
	    };
	  }

	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing â€œwhat changedâ€. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */
	  function dispatch(action) {
	    if (!(0, _isPlainObject2['default'])(action)) {
	      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
	    }

	    if (typeof action.type === 'undefined') {
	      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
	    }

	    if (isDispatching) {
	      throw new Error('Reducers may not dispatch actions.');
	    }

	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }

	    var listeners = currentListeners = nextListeners;
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i]();
	    }

	    return action;
	  }

	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */
	  function replaceReducer(nextReducer) {
	    if (typeof nextReducer !== 'function') {
	      throw new Error('Expected the nextReducer to be a function.');
	    }

	    currentReducer = nextReducer;
	    dispatch({ type: ActionTypes.INIT });
	  }

	  /**
	   * Interoperability point for observable/reactive libraries.
	   * @returns {observable} A minimal observable of state changes.
	   * For more information, see the observable proposal:
	   * https://github.com/zenparsing/es-observable
	   */
	  function observable() {
	    var _ref;

	    var outerSubscribe = subscribe;
	    return _ref = {
	      /**
	       * The minimal observable subscription method.
	       * @param {Object} observer Any object that can be used as an observer.
	       * The observer object should have a `next` method.
	       * @returns {subscription} An object with an `unsubscribe` method that can
	       * be used to unsubscribe the observable from the store, and prevent further
	       * emission of values from the observable.
	       */
	      subscribe: function subscribe(observer) {
	        if (typeof observer !== 'object') {
	          throw new TypeError('Expected the observer to be an object.');
	        }

	        function observeState() {
	          if (observer.next) {
	            observer.next(getState());
	          }
	        }

	        observeState();
	        var unsubscribe = outerSubscribe(observeState);
	        return { unsubscribe: unsubscribe };
	      }
	    }, _ref[_symbolObservable2['default']] = function () {
	      return this;
	    }, _ref;
	  }

	  // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.
	  dispatch({ type: ActionTypes.INIT });

	  return _ref2 = {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  }, _ref2[_symbolObservable2['default']] = observable, _ref2;
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = warning;
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that if you enable
	    // "break on all exceptions" in your console,
	    // it would pause the execution at this line.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var getPrototype = __webpack_require__(8),
	    isHostObject = __webpack_require__(9),
	    isObjectLike = __webpack_require__(11);

	/** `Object#toString` result references. */
	var objectTag = '[object Object]';

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) ||
	      objectToString.call(value) != objectTag || isHostObject(value)) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}

	module.exports = isPlainObject;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports['default'] = applyMiddleware;

	var _compose = __webpack_require__(1);

	var _compose2 = _interopRequireDefault(_compose);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/**
	 * Creates a store enhancer that applies middleware to the dispatch method
	 * of the Redux store. This is handy for a variety of tasks, such as expressing
	 * asynchronous actions in a concise manner, or logging every action payload.
	 *
	 * See `redux-thunk` package as an example of the Redux middleware.
	 *
	 * Because middleware is potentially asynchronous, this should be the first
	 * store enhancer in the composition chain.
	 *
	 * Note that each middleware will be given the `dispatch` and `getState` functions
	 * as named arguments.
	 *
	 * @param {...Function} middlewares The middleware chain to be applied.
	 * @returns {Function} A store enhancer applying the middleware.
	 */
	function applyMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }

	  return function (createStore) {
	    return function (reducer, preloadedState, enhancer) {
	      var store = createStore(reducer, preloadedState, enhancer);
	      var _dispatch = store.dispatch;
	      var chain = [];

	      var middlewareAPI = {
	        getState: store.getState,
	        dispatch: function dispatch(action) {
	          return _dispatch(action);
	        }
	      };
	      chain = middlewares.map(function (middleware) {
	        return middleware(middlewareAPI);
	      });
	      _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);

	      return _extends({}, store, {
	        dispatch: _dispatch
	      });
	    };
	  };
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = bindActionCreators;
	function bindActionCreator(actionCreator, dispatch) {
	  return function () {
	    return dispatch(actionCreator.apply(undefined, arguments));
	  };
	}

	/**
	 * Turns an object whose values are action creators, into an object with the
	 * same keys, but with every function wrapped into a `dispatch` call so they
	 * may be invoked directly. This is just a convenience method, as you can call
	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
	 *
	 * For convenience, you can also pass a single function as the first argument,
	 * and get a function in return.
	 *
	 * @param {Function|Object} actionCreators An object whose values are action
	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
	 * syntax. You may also pass a single function.
	 *
	 * @param {Function} dispatch The `dispatch` function available on your Redux
	 * store.
	 *
	 * @returns {Function|Object} The object mimicking the original object, but with
	 * every action creator wrapped into the `dispatch` call. If you passed a
	 * function as `actionCreators`, the return value will also be a single
	 * function.
	 */
	function bindActionCreators(actionCreators, dispatch) {
	  if (typeof actionCreators === 'function') {
	    return bindActionCreator(actionCreators, dispatch);
	  }

	  if (typeof actionCreators !== 'object' || actionCreators === null) {
	    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
	  }

	  var keys = Object.keys(actionCreators);
	  var boundActionCreators = {};
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var actionCreator = actionCreators[key];
	    if (typeof actionCreator === 'function') {
	      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
	    }
	  }
	  return boundActionCreators;
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = combineReducers;

	var _createStore = __webpack_require__(2);

	var _isPlainObject = __webpack_require__(4);

	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

	var _warning = __webpack_require__(3);

	var _warning2 = _interopRequireDefault(_warning);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function getUndefinedStateErrorMessage(key, action) {
	  var actionType = action && action.type;
	  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

	  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
	}

	function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
	  var reducerKeys = Object.keys(reducers);
	  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

	  if (reducerKeys.length === 0) {
	    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
	  }

	  if (!(0, _isPlainObject2['default'])(inputState)) {
	    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
	  }

	  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
	    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
	  });

	  unexpectedKeys.forEach(function (key) {
	    unexpectedKeyCache[key] = true;
	  });

	  if (unexpectedKeys.length > 0) {
	    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
	  }
	}

	function assertReducerSanity(reducers) {
	  Object.keys(reducers).forEach(function (key) {
	    var reducer = reducers[key];
	    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

	    if (typeof initialState === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
	    }

	    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
	    if (typeof reducer(undefined, { type: type }) === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
	    }
	  });
	}

	/**
	 * Turns an object whose values are different reducer functions, into a single
	 * reducer function. It will call every child reducer, and gather their results
	 * into a single state object, whose keys correspond to the keys of the passed
	 * reducer functions.
	 *
	 * @param {Object} reducers An object whose values correspond to different
	 * reducer functions that need to be combined into one. One handy way to obtain
	 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
	 * undefined for any action. Instead, they should return their initial state
	 * if the state passed to them was undefined, and the current state for any
	 * unrecognized action.
	 *
	 * @returns {Function} A reducer function that invokes every reducer inside the
	 * passed object, and builds a state object with the same shape.
	 */
	function combineReducers(reducers) {
	  var reducerKeys = Object.keys(reducers);
	  var finalReducers = {};
	  for (var i = 0; i < reducerKeys.length; i++) {
	    var key = reducerKeys[i];

	    if (true) {
	      if (typeof reducers[key] === 'undefined') {
	        (0, _warning2['default'])('No reducer provided for key "' + key + '"');
	      }
	    }

	    if (typeof reducers[key] === 'function') {
	      finalReducers[key] = reducers[key];
	    }
	  }
	  var finalReducerKeys = Object.keys(finalReducers);

	  if (true) {
	    var unexpectedKeyCache = {};
	  }

	  var sanityError;
	  try {
	    assertReducerSanity(finalReducers);
	  } catch (e) {
	    sanityError = e;
	  }

	  return function combination() {
	    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var action = arguments[1];

	    if (sanityError) {
	      throw sanityError;
	    }

	    if (true) {
	      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
	      if (warningMessage) {
	        (0, _warning2['default'])(warningMessage);
	      }
	    }

	    var hasChanged = false;
	    var nextState = {};
	    for (var i = 0; i < finalReducerKeys.length; i++) {
	      var key = finalReducerKeys[i];
	      var reducer = finalReducers[key];
	      var previousStateForKey = state[key];
	      var nextStateForKey = reducer(previousStateForKey, action);
	      if (typeof nextStateForKey === 'undefined') {
	        var errorMessage = getUndefinedStateErrorMessage(key, action);
	        throw new Error(errorMessage);
	      }
	      nextState[key] = nextStateForKey;
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	    }
	    return hasChanged ? nextState : state;
	  };
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(10);

	/** Built-in value references. */
	var getPrototype = overArg(Object.getPrototypeOf, Object);

	module.exports = getPrototype;


/***/ },
/* 9 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	module.exports = isHostObject;


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	module.exports = overArg;


/***/ },
/* 11 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(13);


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _ponyfill = __webpack_require__(14);

	var _ponyfill2 = _interopRequireDefault(_ponyfill);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var root = undefined; /* global window */

	if (typeof global !== 'undefined') {
		root = global;
	} else if (typeof window !== 'undefined') {
		root = window;
	}

	var result = (0, _ponyfill2['default'])(root);
	exports['default'] = result;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = symbolObservablePonyfill;
	function symbolObservablePonyfill(root) {
		var result;
		var _Symbol = root.Symbol;

		if (typeof _Symbol === 'function') {
			if (_Symbol.observable) {
				result = _Symbol.observable;
			} else {
				result = _Symbol('observable');
				_Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}

		return result;
	};

/***/ }
/******/ ])
});
;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const Debugger = require("Debugger");
const DevToolsUtils = require("resource://devtools/shared/DevToolsUtils.js");

const lazy = {};
if (!isWorker) {
  ChromeUtils.defineESModuleGetters(
    lazy,
    {
      Reflect: "resource://gre/modules/reflect.sys.mjs",
    },
    { global: "contextual" }
  );
}
loader.lazyRequireGetter(
  this,
  ["isCommand"],
  "resource://devtools/server/actors/webconsole/commands/parser.js",
  true
);
loader.lazyRequireGetter(
  this,
  "WebConsoleCommandsManager",
  "resource://devtools/server/actors/webconsole/commands/manager.js",
  true
);

loader.lazyRequireGetter(
  this,
  "LongStringActor",
  "resource://devtools/server/actors/string.js",
  true
);
loader.lazyRequireGetter(
  this,
  "eagerEcmaAllowlist",
  "resource://devtools/server/actors/webconsole/eager-ecma-allowlist.js"
);
loader.lazyRequireGetter(
  this,
  "eagerFunctionAllowlist",
  "resource://devtools/server/actors/webconsole/eager-function-allowlist.js"
);

function isObject(value) {
  return Object(value) === value;
}

/**
 * Evaluates a string using the debugger API.
 *
 * To allow the variables view to update properties from the Web Console we
 * provide the "selectedObjectActor" mechanism: the Web Console tells the
 * ObjectActor ID for which it desires to evaluate an expression. The
 * Debugger.Object pointed at by the actor ID is bound such that it is
 * available during expression evaluation (executeInGlobalWithBindings()).
 *
 * Example:
 *   _self['foobar'] = 'test'
 * where |_self| refers to the desired object.
 *
 * The |frameActor| property allows the Web Console client to provide the
 * frame actor ID, such that the expression can be evaluated in the
 * user-selected stack frame.
 *
 * For the above to work we need the debugger and the Web Console to share
 * a connection, otherwise the Web Console actor will not find the frame
 * actor.
 *
 * The Debugger.Frame comes from the jsdebugger's Debugger instance, which
 * is different from the Web Console's Debugger instance. This means that
 * for evaluation to work, we need to create a new instance for the Web
 * Console Commands helpers - they need to be Debugger.Objects coming from the
 * jsdebugger's Debugger instance.
 *
 * When |selectedObjectActor| is used objects can come from different iframes,
 * from different domains. To avoid permission-related errors when objects
 * come from a different window, we also determine the object's own global,
 * such that evaluation happens in the context of that global. This means that
 * evaluation will happen in the object's iframe, rather than the top level
 * window.
 *
 * @param string string
 *        String to evaluate.
 * @param object [options]
 *        Options for evaluation:
 *        - selectedObjectActor: the ObjectActor ID to use for evaluation.
 *          |evalWithBindings()| will be called with one additional binding:
 *          |_self| which will point to the Debugger.Object of the given
 *          ObjectActor. Executes with the top level window as the global.
 *        - frameActor: the FrameActor ID to use for evaluation. The given
 *        debugger frame is used for evaluation, instead of the global window.
 *        - selectedNodeActor: the NodeActor ID of the currently selected node
 *        in the Inspector (or null, if there is no selection). This is used
 *        for helper functions that make reference to the currently selected
 *        node, like $0.
 *        - innerWindowID: An optional window id to use instead of webConsole.evalWindow.
 *        This is used by function that need to evaluate in a different window for which
 *        we don't have a dedicated target (for example a non-remote iframe).
 *        - eager: Set to true if you want the evaluation to bail if it may have side effects.
 *        - url: the url to evaluate the script as. Defaults to "debugger eval code",
 *        or "debugger eager eval code" if eager is true.
 *        - preferConsoleCommandsOverLocalSymbols: Set to true if console commands
 *        should override local symbols.
 * @param object webConsole
 *
 * @return object
 *         An object that holds the following properties:
 *         - dbg: the debugger where the string was evaluated.
 *         - frame: (optional) the frame where the string was evaluated.
 *         - global: the Debugger.Object for the global where the string was evaluated in.
 *         - result: the result of the evaluation.
 */
function evalWithDebugger(string, options = {}, webConsole) {
  const trimmedString = string.trim();
  // The help function needs to be easy to guess, so accept "?" as a shortcut
  if (trimmedString === "?") {
    return evalWithDebugger(":help", options, webConsole);
  }

  const isCmd = isCommand(trimmedString);

  if (isCmd && options.eager) {
    return {
      result: null,
    };
  }

  const { frame, dbg } = getFrameDbg(options, webConsole);

  const { dbgGlobal, bindSelf } = getDbgGlobal(options, dbg, webConsole);

  // If the strings starts with a `:`, do not try to evaluate the strings
  // and instead only call the related command function directly from
  // the privileged codebase.
  if (isCmd) {
    try {
      return WebConsoleCommandsManager.executeCommand(
        webConsole,
        dbgGlobal,
        options.selectedNodeActor,
        string
      );
    } catch (e) {
      // Catch any exception and return a result similar to the output
      // of executeCommand to notify the client about this unexpected error.
      return {
        helperResult: {
          type: "exception",
          message: e.message,
        },
      };
    }
  }

  const helpers = WebConsoleCommandsManager.getWebConsoleCommands(
    webConsole,
    dbgGlobal,
    frame,
    string,
    options.selectedNodeActor,
    options.preferConsoleCommandsOverLocalSymbols
  );
  let { bindings } = helpers;

  // Ease calling the help command by not requiring the "()".
  // But wait for the bindings computation in order to know if "help" variable
  // was overloaded by the page. If it is missing from bindings, it is overloaded and we should
  // display its value by doing a regular evaluation.
  if (trimmedString === "help" && bindings.help) {
    return evalWithDebugger(":help", options, webConsole);
  }

  // '_self' refers to the JS object references via options.selectedObjectActor.
  // This isn't exposed on typical console evaluation, but only when "Store As Global"
  // runs an invisible script storing `_self` into `temp${i}`.
  if (bindSelf) {
    bindings._self = bindSelf;
  }

  // Log points calls this method from the server side and pass additional variables
  // to be exposed to the evaluated JS string
  if (options.bindings) {
    bindings = { ...bindings, ...options.bindings };
  }

  const evalOptions = {};

  const urlOption =
    options.url || (options.eager ? "debugger eager eval code" : null);
  if (typeof urlOption === "string") {
    evalOptions.url = urlOption;
  }

  if (typeof options.lineNumber === "number") {
    evalOptions.lineNumber = options.lineNumber;
  }

  if (options.disableBreaks || options.eager) {
    // When we are disabling breakpoints for a given evaluation, or when we are doing an eager evaluation,
    // also prevent spawning related Debugger.Source object to avoid showing it
    // in the debugger UI
    evalOptions.hideFromDebugger = true;
  }

  if (options.preferConsoleCommandsOverLocalSymbols) {
    evalOptions.useInnerBindings = true;
  }

  updateConsoleInputEvaluation(dbg, webConsole);

  const evalString = getEvalInput(string, bindings);
  const result = getEvalResult(
    dbg,
    evalString,
    evalOptions,
    bindings,
    frame,
    dbgGlobal,
    options.eager
  );

  // Attempt to initialize any declarations found in the evaluated string
  // since they may now be stuck in an "initializing" state due to the
  // error. Already-initialized bindings will be ignored.
  if (!frame && result && "throw" in result) {
    forceLexicalInitForVariableDeclarationsInThrowingExpression(
      dbgGlobal,
      string
    );
  }

  return {
    result,
    // Retrieve the result of commands, if any ran
    helperResult: helpers.getHelperResult(),
    dbg,
    frame,
    dbgGlobal,
  };
}
exports.evalWithDebugger = evalWithDebugger;

/**
 * Sub-function to reduce the complexity of evalWithDebugger.
 * This focuses on calling Debugger.Frame or Debugger.Object eval methods.
 *
 * @param {Debugger} dbg
 * @param {String} string
 *        The string to evaluate.
 * @param {Object} evalOptions
 *        Spidermonkey options to pass to eval methods.
 * @param {Object} bindings
 *        Dictionary object with symbols to override in the evaluation.
 * @param {Debugger.Frame} frame
 *        If paused, the paused frame.
 * @param {Debugger.Object} dbgGlobal
 *        The target's global.
 * @param {Boolean} eager
 *        Is this an eager evaluation?
 * @return {Object}
 *        The evaluation result object.
 *        See `Debugger.Ojbect.executeInGlobalWithBindings` definition.
 */
function getEvalResult(
  dbg,
  string,
  evalOptions,
  bindings,
  frame,
  dbgGlobal,
  eager
) {
  // When we are doing an eager evaluation, we aren't using the target's Debugger object
  // but a special one, dedicated to each evaluation.
  let noSideEffectDebugger = null;
  if (eager) {
    noSideEffectDebugger = makeSideeffectFreeDebugger(dbg);

    // When a sideeffect-free debugger has been created, we need to eval
    // in the context of that debugger in order for the side-effect tracking
    // to apply.
    if (frame) {
      frame = noSideEffectDebugger.adoptFrame(frame);
    } else {
      dbgGlobal = noSideEffectDebugger.adoptDebuggeeValue(dbgGlobal);
    }
    if (bindings) {
      bindings = Object.keys(bindings).reduce((acc, key) => {
        acc[key] = noSideEffectDebugger.adoptDebuggeeValue(bindings[key]);
        return acc;
      }, {});
    }
  }

  try {
    let result;
    if (frame) {
      result = frame.evalWithBindings(string, bindings, evalOptions);
    } else {
      result = dbgGlobal.executeInGlobalWithBindings(
        string,
        bindings,
        evalOptions
      );
    }
    if (noSideEffectDebugger && result) {
      if ("return" in result) {
        result.return = dbg.adoptDebuggeeValue(result.return);
      }
      if ("throw" in result) {
        result.throw = dbg.adoptDebuggeeValue(result.throw);
      }
    }
    return result;
  } finally {
    // We need to be absolutely sure that the sideeffect-free debugger's
    // debuggees are removed because otherwise we risk them terminating
    // execution of later code in the case of unexpected exceptions.
    if (noSideEffectDebugger) {
      noSideEffectDebugger.onNativeCall = undefined;
      noSideEffectDebugger.shouldAvoidSideEffects = false;
      // Ensure removing the debuggee only as the very last step as various
      // cleanups within the Debugger API are done per still-registered debuggee.
      noSideEffectDebugger.removeAllDebuggees();
    }
  }
}

/**
 * Force lexical initialization for let/const variables declared in a throwing expression.
 * By spec, a lexical declaration is added to the *page-visible* global lexical environment
 * for those variables, meaning they can't be redeclared (See Bug 1246215).
 *
 * This function gets the AST of the throwing expression to collect all the let/const
 * declarations and call `forceLexicalInitializationByName`, which will initialize them
 * to undefined, making it possible for them to be redeclared.
 *
 * @param {DebuggerObject} dbgGlobal
 * @param {String} string: The expression that was evaluated and threw
 * @returns
 */
function forceLexicalInitForVariableDeclarationsInThrowingExpression(
  dbgGlobal,
  string
) {
  // Reflect is not usable in workers, so return early to avoid logging an error
  // to the console when loading it.
  if (isWorker) {
    return;
  }

  let ast;
  // Parse errors will raise an exception. We can/should ignore the error
  // since it's already being handled elsewhere and we are only interested
  // in initializing bindings.
  try {
    ast = lazy.Reflect.parse(string);
  } catch (e) {
    return;
  }

  try {
    for (const line of ast.body) {
      // Only let and const declarations put bindings into an
      // "initializing" state.
      if (!(line.kind == "let" || line.kind == "const")) {
        continue;
      }

      const identifiers = [];
      for (const decl of line.declarations) {
        switch (decl.id.type) {
          case "Identifier":
            // let foo = bar;
            identifiers.push(decl.id.name);
            break;
          case "ArrayPattern":
            // let [foo, bar]    = [1, 2];
            // let [foo=99, bar] = [1, 2];
            for (const e of decl.id.elements) {
              if (e.type == "Identifier") {
                identifiers.push(e.name);
              } else if (e.type == "AssignmentExpression") {
                identifiers.push(e.left.name);
              }
            }
            break;
          case "ObjectPattern":
            // let {bilbo, my}    = {bilbo: "baggins", my: "precious"};
            // let {blah: foo}    = {blah: yabba()}
            // let {blah: foo=99} = {blah: yabba()}
            for (const prop of decl.id.properties) {
              // key
              if (prop.key?.type == "Identifier") {
                identifiers.push(prop.key.name);
              }
              // value
              if (prop.value?.type == "Identifier") {
                identifiers.push(prop.value.name);
              } else if (prop.value?.type == "AssignmentExpression") {
                identifiers.push(prop.value.left.name);
              } else if (prop.type === "SpreadExpression") {
                identifiers.push(prop.expression.name);
              }
            }
            break;
        }
      }

      for (const name of identifiers) {
        dbgGlobal.forceLexicalInitializationByName(name);
      }
    }
  } catch (ex) {
    console.error(
      "Error in forceLexicalInitForVariableDeclarationsInThrowingExpression:",
      ex
    );
  }
}

/**
 * Creates a side-effect-free Debugger instance.
 *
 * @param {Debugger} targetActorDbg
 *        The target actor's dbg object, crafted by make-debugger.js module.
 * @return {Debugger}
 *         Side-effect-free Debugger instance.
 */
function makeSideeffectFreeDebugger(targetActorDbg) {
  // Populate the cached Map once before the evaluation
  ensureSideEffectFreeNatives();

  // Note: It is critical for debuggee performance that we implement all of
  // this debuggee tracking logic with a separate Debugger instance.
  // Bug 1617666 arises otherwise if we set an onEnterFrame hook on the
  // existing debugger object and then later clear it.
  //
  // Also note that we aren't registering any global to this debugger.
  // We will only adopt values into it: the paused frame (if any) or the
  // target's global (when not paused).
  const dbg = new Debugger();

  // Special flag in order to ensure that any evaluation or call being
  // made via this debugger will be ignored by all debuggers except this one.
  dbg.exclusiveDebuggerOnEval = true;

  // We need to register all target actor's globals.
  // In most cases, this will be only one global, except for the browser toolbox,
  // where process target actors may interact with many.
  // On the browser toolbox, we may have many debuggees and this is important to register
  // them in order to detect native call made from/to these others globals.
  for (const global of targetActorDbg.findDebuggees()) {
    try {
      dbg.addDebuggee(global);
    } catch (e) {
      // Ignore exceptions from the following cases:
      //   * A global from the same compartment (happens with parent process)
      //   * A dead wrapper (happens when the reference gets nuked after
      //     findAllGlobals call)
      if (
        !e.message.includes(
          "debugger and debuggee must be in different compartments"
        ) &&
        !e.message.includes("can't access dead object")
      ) {
        throw e;
      }
    }
  }

  const timeoutDuration = 100;
  const endTime = Date.now() + timeoutDuration;
  let count = 0;
  function shouldCancel() {
    // To keep the evaled code as quick as possible, we avoid querying the
    // current time on ever single step and instead check every 100 steps
    // as an arbitrary count that seemed to be "often enough".
    return ++count % 100 === 0 && Date.now() > endTime;
  }

  const executedScripts = new Set();
  const handler = {
    hit: () => null,
  };
  dbg.onEnterFrame = frame => {
    if (shouldCancel()) {
      return null;
    }
    frame.onStep = () => {
      if (shouldCancel()) {
        return null;
      }
      return undefined;
    };

    const script = frame.script;

    if (executedScripts.has(script)) {
      return undefined;
    }
    executedScripts.add(script);

    const offsets = script.getEffectfulOffsets();
    for (const offset of offsets) {
      script.setBreakpoint(offset, handler);
    }

    return undefined;
  };

  // The debugger only calls onNativeCall handlers on the debugger that is
  // explicitly calling either eval, DebuggerObject.apply or DebuggerObject.call,
  // so we need to add this hook on "dbg" even though the rest of our hooks work via "newDbg".
  const { SIDE_EFFECT_FREE } = WebConsoleCommandsManager;
  dbg.onNativeCall = (callee, reason) => {
    try {
      // Setters are always effectful. Natives called normally or called via
      // getters are handled with an allowlist.
      if (
        (reason == "get" || reason == "call") &&
        nativeIsEagerlyEvaluateable(callee)
      ) {
        // Returning undefined causes execution to continue normally.
        return undefined;
      }
    } catch (err) {
      DevToolsUtils.reportException(
        "evalWithDebugger onNativeCall",
        new Error("Unable to validate native function against allowlist")
      );
    }

    // The WebConsole Commands manager will use Cu.exportFunction which will force
    // to call a native method which is hard to identify.
    // getEvalResult will flag those getter methods with a magic attribute.
    if (
      reason == "call" &&
      callee.unsafeDereference().isSideEffectFree === SIDE_EFFECT_FREE
    ) {
      // Returning undefined causes execution to continue normally.
      return undefined;
    }

    // Returning null terminates the current evaluation.
    return null;
  };
  dbg.shouldAvoidSideEffects = true;

  return dbg;
}

// Native functions which are considered to be side effect free.
let gSideEffectFreeNatives; // string => Array(Function)

/**
 * Generate gSideEffectFreeNatives map.
 */
function ensureSideEffectFreeNatives() {
  if (gSideEffectFreeNatives) {
    return;
  }

  const { natives: domNatives } = eagerFunctionAllowlist;

  const natives = [
    ...eagerEcmaAllowlist.functions,
    ...eagerEcmaAllowlist.getters,

    // Pull in all of the non-ECMAScript native functions that we want to
    // allow as well.
    ...domNatives,
  ];

  const map = new Map();
  for (const n of natives) {
    if (!map.has(n.name)) {
      map.set(n.name, []);
    }
    map.get(n.name).push(n);
  }

  gSideEffectFreeNatives = map;
}

function nativeIsEagerlyEvaluateable(fn) {
  if (fn.isBoundFunction) {
    fn = fn.boundTargetFunction;
  }

  // We assume all DOM getters have no major side effect, and they are
  // eagerly-evaluateable.
  //
  // JitInfo is used only by methods/accessors in WebIDL, and being
  // "a getter with JitInfo" can be used as a condition to check if given
  // function is DOM getter.
  //
  // This includes privileged interfaces in addition to standard web APIs.
  if (fn.isNativeGetterWithJitInfo()) {
    return true;
  }

  // Natives with certain names are always considered side effect free.
  switch (fn.name) {
    case "toString":
    case "toLocaleString":
    case "valueOf":
      return true;
  }

  // This needs to use isSameNativeWithJitInfo instead of isSameNative, given
  // DOM methods share single native function with different JSJitInto,
  // and isSameNative cannot distinguish between side-effect-free methods
  // and others.
  const natives = gSideEffectFreeNatives.get(fn.name);
  return natives && natives.some(n => fn.isSameNativeWithJitInfo(n));
}

function updateConsoleInputEvaluation(dbg, webConsole) {
  // Adopt webConsole._lastConsoleInputEvaluation value in the new debugger,
  // to prevent "Debugger.Object belongs to a different Debugger" exceptions
  // related to the $_ bindings if the debugger object is changed from the
  // last evaluation.
  if (webConsole._lastConsoleInputEvaluation) {
    webConsole._lastConsoleInputEvaluation = dbg.adoptDebuggeeValue(
      webConsole._lastConsoleInputEvaluation
    );
  }
}

function getEvalInput(string) {
  const trimmedString = string.trim();
  // Add easter egg for console.mihai().
  if (
    trimmedString == "console.mihai()" ||
    trimmedString == "console.mihai();"
  ) {
    return '"http://incompleteness.me/blog/2015/02/09/console-dot-mihai/"';
  }
  return string;
}

function getFrameDbg(options, webConsole) {
  if (!options.frameActor) {
    return { frame: null, dbg: webConsole.dbg };
  }
  // Find the Debugger.Frame of the given FrameActor.
  const frameActor = webConsole.conn.getActor(options.frameActor);
  if (frameActor) {
    // If we've been given a frame actor in whose scope we should evaluate the
    // expression, be sure to use that frame's Debugger (that is, the JavaScript
    // debugger's Debugger) for the whole operation, not the console's Debugger.
    // (One Debugger will treat a different Debugger's Debugger.Object instances
    // as ordinary objects, not as references to be followed, so mixing
    // debuggers causes strange behaviors.)
    return { frame: frameActor.frame, dbg: frameActor.threadActor.dbg };
  }
  return DevToolsUtils.reportException(
    "evalWithDebugger",
    Error("The frame actor was not found: " + options.frameActor)
  );
}

/**
 * Get debugger object for given debugger and Web Console.
 *
 * @param object options
 *        See the `options` parameter of evalWithDebugger
 * @param {Debugger} dbg
 *        Debugger object
 * @param {WebConsoleActor} webConsole
 *        A reference to a webconsole actor which is used to get the target
 *        eval global and optionally the target actor
 * @return object
 *         An object that holds the following properties:
 *         - bindSelf: (optional) the self object for the evaluation
 *         - dbgGlobal: the global object reference in the debugger
 */
function getDbgGlobal(options, dbg, webConsole) {
  let evalGlobal = webConsole.evalGlobal;

  if (options.innerWindowID) {
    const window = Services.wm.getCurrentInnerWindowWithId(
      options.innerWindowID
    );

    if (window) {
      evalGlobal = window;
    }
  }

  const dbgGlobal = dbg.makeGlobalObjectReference(evalGlobal);

  // If we have an object to bind to |_self|, create a Debugger.Object
  // referring to that object, belonging to dbg.
  if (!options.selectedObjectActor) {
    return { bindSelf: null, dbgGlobal };
  }

  // All the Object Actors are collected in the Target Actor's "objectsPool",
  // except for objects communicated by the thread actor on pause,
  // or by the JS Tracer.
  // But the "selected object actor" is generated via the console actor evaluation,
  // which stores its objects actor in the target's shared pool.
  const actor = webConsole.targetActor.objectsPool.getActorByID(
    options.selectedObjectActor
  );

  if (!actor) {
    return { bindSelf: null, dbgGlobal };
  }

  const jsVal = actor instanceof LongStringActor ? actor.str : actor.rawObj;
  if (!isObject(jsVal)) {
    return { bindSelf: jsVal, dbgGlobal };
  }

  // If we use the makeDebuggeeValue method of jsVal's own global, then
  // we'll get a D.O that sees jsVal as viewed from its own compartment -
  // that is, without wrappers. The evalWithBindings call will then wrap
  // jsVal appropriately for the evaluation compartment.
  const bindSelf = dbgGlobal.makeDebuggeeValue(jsVal);
  return { bindSelf, dbgGlobal };
}
