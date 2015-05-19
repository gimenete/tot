# tot
Experimental language, superset of JavaScript, for writing async code like sync code


Example (example.tot)

```javascript
function something(message, callback) {
  setTimeout(function() {
    // if (message === 'bar') return callback(new Error('bar is not supported'))
    callback(null, 'hello '+message)
  }, 1)
}

function done() {
  var args = Array.prototype.slice.call(arguments)
  console.log('Done')
  console.log(args.join('\n'))
}

exports.hello = function() {
  try {
    var foo =: something('foo')
    var bar =: something('bar')
    var baz =: something('baz')

    done(foo, bar, baz)
  } catch(e) {
    console.log('error', e.message)
  }

}
```

Usage:

First init the npm module

```javascript
require('tot')
```

Then you can require any `.tot` file.

```javascript
require('./example').hello()
```
