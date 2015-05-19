var esprima = require('esprima-tot')
var escodegen = require('escodegen')
var fs = require('fs')

require.extensions['.tot'] = function (obj, path) {
  var source = fs.readFileSync(path, 'utf8')
  var syntax = esprima.parse(source)

  processNode(syntax)

  var js = escodegen.generate(syntax)

  var finalPath = path+'.js'
  fs.writeFileSync(finalPath, js, 'utf8')
  return require.extensions['.js'](obj, finalPath)

  var lastTryStatement
  function processNode(node) {
    if (!node) return
    if (node.constructor === Array) {
      var arr = node
      var all = arr.slice()
      var i = 0
      while (true) {
        var n = all.shift()
        if (!n) return

        if (n.type === 'VariableDeclaration') {
          var declarations = n.declarations
          var declaration = declarations[0]
          if (declaration
              && declaration.type === 'VariableDeclarator'
              && declaration.id.type === 'Identifier'
              && declaration.init
              && declaration.init.async === true
              && declaration.init.type === 'CallExpression') {

            var body = arr.splice(i+1)
            arr.splice(i, i+1, declaration.init)
            var errname = (lastTryStatement.handler
                          && lastTryStatement.handler.param
                          && lastTryStatement.handler.param.name
                          )
                          || 'err'
            if (lastTryStatement
              && lastTryStatement.handler
              && lastTryStatement.handler.body) {
                var errBody = lastTryStatement.handler.body.body.slice()
                errBody.push({
                  "type": "ReturnStatement",
                  "argument": null
                })
                body.splice(0, 0, {
                  "type": "IfStatement",
                  "test": {
                    "type": "Identifier",
                    "name": errname
                  },
                  "consequent": {
                    "type": "BlockStatement",
                    "body": errBody,
                  }
                })
            }
            var callback = {
              "type": "FunctionExpression",
              "id": null,
              "params": [
                {
                  "type": "Identifier",
                  "name": errname
                },
                {
                  "type": "Identifier",
                  "name": declaration.id.name
                }
              ],
              "defaults": [],
              "body": {
                "type": "BlockStatement",
                "body": body
              },
              "generator": false,
              "expression": false
            }
            var arguments = declaration.init.arguments
            arguments.push(callback)
            processNode(body)

            return
          }
        }

        processNode(n)
        i++
      }
      return
    }

    if (node.type === 'Program') {
      processNode(node.body)
    } else if (node.type === 'BlockStatement') {
      processNode(node.body)
    } else if (node.type === 'IfStatement') {
      processNode(node.consequent)
      processNode(node.alternate)
    } else if (node.type === 'ConditionalExpression') {
      processNode(node.test)
      processNode(node.consequent)
      processNode(node.alternate)
    } else if (node.type === 'LogicalExpression') {
      processNode(node.left)
      processNode(node.right)
    } else if (node.type === 'UnaryExpression') {
      processNode(node.argument)
    } else if (node.type === 'BinaryExpression') {
      processNode(node.left)
      processNode(node.right)
    } else if (node.type === 'CallExpression') {
      processNode(node.callee)
      processNode(node.arguments)
    } else if (node.type === 'NewExpression') {
      processNode(node.callee)
    } else if (node.type === 'WithStatement') {
      processNode(node.object)
      processNode(node.body)
    } else if (node.type === 'ThrowStatement') {
      processNode(node.argument)
    } else if (node.type === 'ObjectExpression') {
      processNode(node.properties)
    } else if (node.type === 'ArrayExpression') {
      processNode(node.elements)
    } else if (node.type === 'WhileStatement') {
      processNode(node.test)
      processNode(node.body)
    } else if (node.type === 'DoWhileStatement') {
      processNode(node.test)
      processNode(node.body)
    } else if (node.type === 'ForInStatement') {
      processNode(node.left)
      processNode(node.right)
      processNode(node.body)
    } else if (node.type === 'ForStatement') {
      processNode(node.init)
      processNode(node.test)
      processNode(node.update)
      processNode(node.body)
    } else if (node.type === 'SwitchStatement') {
      processNode(node.discriminant)
      processNode(node.cases)
    } else if (node.type === 'SwitchCase') {
      processNode(node.test)
      processNode(node.consequent)
    } else if (node.type === 'TryStatement') {
      lastTryStatement = node
      processNode(node.block)
      processNode(node.handlers)
      processNode(node.finalizer)
    } else if (node.type === 'CatchClause') {
      processNode(node.body)
    } else if (node.type === 'ReturnStatement') {
      processNode(node.argument)
    } else if (node.type === 'VariableDeclaration') {
      processNode(node.init)
      processNode(node.declarations)
    } else if (node.type === 'VariableDeclarator') {
      processNode(node.id)
      processNode(node.init)
    } else if (node.type === 'Property') {
      processNode(node.key)
      processNode(node.value)
    } else if (node.type === 'ExpressionStatement') {
      processNode(node.expression)
    } else if (node.type === 'MemberExpression') {
      processNode(node.object)
      processNode(node.property)
    } else if (node.type === 'AssignmentExpression') {
      processNode(node.left)
      processNode(node.right)
    } else if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
      lastTryStatement = null
      processNode(node.body)
    } else if (node.type === 'Identifier') {
      // such as "foo" (without the quotes)
    } else if (node.type === 'Literal') {
      // such as "foo" (with the quotes)
    } else if (node.type === 'UpdateExpression') {
      // such as "i++"
    } else if (node.type === 'EmptyStatement') {
    } else if (node.type === 'BreakStatement') {
    } else if (node.type === 'ThisExpression') {
    } else {
      if (debug) {
        console.log('unknown node type! ---------------------------------', node)
      }
    }
  }
}
