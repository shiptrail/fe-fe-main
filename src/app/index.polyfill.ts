interface Array<T> {
  find(predicate: (search: T, index?: number, array?:Array<T>) => boolean): T;
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list:any = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

interface Callback { (data: any): void; }

declare class EventSource {
  onmessage: Callback;
  addEventListener(event: string, cb: Callback): void;
  constructor(name: string);
}
