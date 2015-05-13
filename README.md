# event-pool [![Build Status](https://travis-ci.org/pajtai/event-pool.png?branch=master)](https://travis-ci.org/pajtai/event-pool)
===

This is an event library in which event triggering is followed by optional confirmation that the events were responded to. Events can also return values.

The library is a singleton, so it can be used to coordinate among multiple modules.

Events are registered via a name and an optional label.
Registering an event to a name returns the number of
events registered with that name.

```javascript
var events = require('event-pool');
1 === events.register('group', function() {...}, 'label');
```

Events are triggered in the order registered. All event callbacks are called in order. The trigger  event returns a promise, and this promise is only resolved once all the promises returned by the callbacks - if any - are resolved.

```javascript
var events = require('event-pool');
events
  .register('group', function() {
    console.log(1);
  });
events
  .register('group', function() {
    console.log(2);
  });
events
  .trigger('group')
  .then(function() {
    console.log(3);
  });

// output
1
2
3
```

The name is used to group the events. When triggering, all events registered with the same name are fired. Labels are used to send arguments to and recover returned values from events.

Trigger returns an object with the values returned or resolved from the callbacks. Each key on this object has an array as a value. The array is filled with the items returned or resolved for the label that corresponds to the key.

```javascript
var events = require('event-pool');

events.register('group', function(add) {
  return 'bar' + add;
}, 'foo');
events.register('group', function() {
  return BB
    .delay(500)
    .resolve('http');
}, 'url');

events
  .trigger('group', {
    // passing arguments to the call backs
    'foo' : ['tholomew']
  })
  .then(function(response) {
      console.log(response);
  });

// output
{
  "foo" : [ "bartholomew" ],
  "url" : [ "http" ]
}
```

If you need to run several callbacks in a series, string them together with a promise chain, and register the whole
chain. If you need to run several callbacks in parallel, register each one.
