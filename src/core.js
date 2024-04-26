export function program(statements) {
  return { kind: "Program", statements }
}

export function functionDeclaration(fun, params, body) {
  return { kind: "FunctionDeclaration", fun, params, body }
}

export function fun(name, type) {
  return { kind: "Function", name, type }
}

export function variableDeclaration(variable, initializer) {
  return { kind: "VariableDeclaration", variable, initializer }
}

export function variable(name, readOnly, type) {
  return { kind: "Variable", name, readOnly, type }
}

export function field(name, type) {
  return { kind: "Field", name, type }
}

export function classDeclaration(name, type) {
  return { kind: "ClassDeclaration", name, type }
}

export function method(name, type) {
  return { kind: "Method", name, type }
}

export function methodDeclaration(method, params, body) {
  return { kind: "MethodDeclaration", method, params, body }
}

export function classType(name, fields, methods) {
  return { kind: "ClassType", name, fields, methods }
}

export function arrayType(baseType) {
  return { kind: "ArrayType", baseType }
}

export const boolType = { kind: "BoolType" }
export const pumpType = { kind: "PumpType" }
export const roastType = { kind: "RoastType" }
export const noneType = { kind: "NoneType" }
export const anyType = { kind: "AnyType" }

export function functionType(paramTypes, returnType) {
  return { kind: "FunctionType", paramTypes, returnType }
}

export function optionalType(baseType) {
  return { kind: "OptionalType", baseType }
}

export function printStatement(expression) {
  return { kind: "PrintStatement", expression }
}

export function increment(variable) {
  return { kind: "Increment", variable }
}

export function decrement(variable) {
  return { kind: "Decrement", variable }
}

export function assignment(target, source) {
  return { kind: "Assignment", target, source }
}

export function subscript(array, index) {
  return {
    kind: "SubscriptExpression",
    array,
    index,
    type: array.type.baseType,
  }
}

export function arrayExpression(elements) {
  return {
    kind: "ArrayExpression",
    elements,
    type: arrayType(elements[0].type),
  }
}

export function emptyArray(type) {
  return { kind: "EmptyArray", type }
}

export function call(callee, args) {
  return { kind: "Call", callee, args, type: callee.type.returnType }
}

// export function constructorCall(callee, args) {
//   return { kind: "ConstructorCall", callee, args, type: callee }
// }

export const breakStatement = { kind: "BreakStatement" }

export function returnStatement(expression) {
  return { kind: "ReturnStatement", expression }
}

export function ifStatement(test, consequent, alternate) {
  return { kind: "IfStatement", test, consequent, alternate }
}

export function shortIfStatement(test, consequent) {
  return { kind: "shortIfStatement", test, consequent }
}

export function whileStatement(test, body) {
  return { kind: "WhileStatement", test, body }
}

export function forStatement(iterator, collection, body) {
  return { kind: "ForStatement", iterator, collection, body }
}

export function conditional(test, consequent, alternate, type) {
  return { kind: "Conditional", test, consequent, alternate, type }
}

export function binary(op, left, right, type) {
  return { kind: "BinaryExpression", op, left, right, type }
}

export function unary(op, operand, type) {
  return { kind: "UnaryExpression", op, operand, type }
}

export const standardLibrary = Object.freeze({
  pump: pumpType,
  boolean: boolType,
  roast: roastType,
  none: noneType,
  any: anyType,
})

String.prototype.type = roastType
Number.prototype.type = pumpType
Boolean.prototype.type = boolType
