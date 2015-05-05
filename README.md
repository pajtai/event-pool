# actions (current state: pre alpha) [![Build Status](https://travis-ci.org/pajtai/promised-actions.png?branch=master)](https://travis-ci.org/pajtai/promised-actions)
===

The actions library is a way to coordinate multiple events / promise chains.

You use the library to register callbacks that will be triggered when an action happens. When you trigger an action
a promise is returned which is only resolved when all callbacks registered with the action are resolved. Callbacks
should return promises, if they don't, they are assumed to be resolved.

If you need to run several callbacks in a series, string them together with a promise chain, and register the whole
chain. If you need to run several callbacks in parallel, register each one.

examples:

```javascript
var actions = require('actions'),
    player = actions.create(),
    count;
    
// The optional third parameter can be used to track received and returned payloads
count = player.register('initialize', getAssetUrl, 'getAssetUrl');
// 1 === count

count = player.register('initialize', getPlayLicense, 'getPlayLicense')
// 2 === count

count = player.register('initialize', hideIntro);
// 3 === count

player.info('inititalize');
// { count: 3, labels: ['getAssetUrl', 'getPlayLicense'] }

player
    .trigger('initialize', {
        getAssetUrl: 43552,
        getPlayLicense: { user: 2, license: 562 }
    })
    .then(function(returned) {
        console.log('asset url:', returned.getAssetUrl);
        console.log('play license:', returned.getPlayLicense);
    })
    .catch(function(error) {
        console.log('something went wrong:', error);
    });
```

