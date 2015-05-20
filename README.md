# tot

Experimental language, superset of JavaScript, for writing async code like sync code.

## Example

With tot you can call async functions like if they were sync. For exmaple you have the following funciton:

```javascript
function something(message, callback) {
  setTimeout(function() {
    callback(null, 'hello '+message)
  }, 1)
}
```

Tot adds a new operator `=:` that lets you call this function like this:

```javascript
var world =: something('world')
```

## Full example

Full example (example.tot)

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

## Usage

First init the npm module (install it with `npm install tot --save`)

```javascript
require('tot')
```

Then you can require any `.tot` file.

```javascript
require('./example').hello()
```

## Benefits

- Any async function can be used
- You don't have to change the way you create async functions
- It is simple as hell

## How it works

Tot compiles to JavaScript. It converts this:

```javascript
var foo =: something('foo')
var bar =: something('bar')
```

into this

```javascript
something('foo', function(err, foo) {
  something('bar', function(err, foo) {
    
  })
})
```

And if you surround the code within a `try - catch` it also handles the error in every callback using the code you wrote in the `catch` block.


## Things to have in mind

### Tot is block-based

When using `=:` all the code from that operator to the end of the current block will be executed asynchronously (even though the syntax looks sync code). But anything outside the current block will be executed synchronously. For example:

```javascript
if (condition) {
  var foo =: something('foo')
  console.log('world')
}
console.log('hello')
```

Tot generates the following code for this example:

```javascript
if (condition) {
  something('foo', function(err, foo) {
    console.log('world')
  })
}
console.log('hello')
```

So `console.log('hello')` is always executed before `console.log('world')`

### Arguments

The special `arguments` variable available in JavaScript when executing a function is also available but after any use of `=:` it will not match what you expect. If you want to use it, make a copy of it first:

```javascript
// make a copy into an array
var args = Array.prototype.slice.call(arguments)
var foo =: something('foo')
// do not use `arguments` here
```

## Hot it doesn't work

- Tot does not create threads
- Tot does not spawn processes

## Sysntax highlighting in Sublime Text

Open a `.tot` file and go to the menu `View → Syntax → Open all with current extension as... → JavaScript → JavaScript` and all `.tot` files will be highlighted as JavaScript. Even though the `=:` does not exist in JavaScript the syntax highlighting will work pretty well.

## Drawbacks

Since Tot compiles to JavaScript any stack trace will reference lines of code of the generated JavaScript and not the original Tot code. This could be fixed using sourcemaps in a future.

## Roadmap

- Support many returned variables with the following syntax:

```javascript
var foo, bar =: something()
```