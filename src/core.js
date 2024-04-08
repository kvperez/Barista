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

export function classType(name, fields, methods) {
  return { kind: "ClassType", name, fields, methods }
}

// export function objectConstructor(name, fields, type) {
//   return { kind: "ObjectConstructor", name, fields, type }
// }

export function arrayType(baseType) {
  return { kind: "ArrayType", baseType }
}

export const boolType = { kind: "BoolType" }
export const intType = { kind: "IntType" }
export const floatType = { kind: "FloatType" }
export const stringType = { kind: "StringType" }
export const noneType = { kind: "NoneType" }
export const anyType = { kind: "AnyType" }

export function functionType(paramTypes, returnType) {
  return { kind: "FunctionType", paramTypes, returnType }
}

export function optionalType(baseType) {
  return { kind: "OptionalType", baseType }
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

export const breakStatement = { kind: "BreakStatement" }

export function returnStatement(expression) {
  return { kind: "ReturnStatement", expression }
}

export function ifStatement(test, consequent, alternate) {
  return { kind: "IfStatement", test, consequent, alternate }
}

export function elseIfStatement(test, consequent) {
  return { kind: "elseIfStatement", test, consequent }
}

export function elseStatement(consequent) {
  return { kind: "elseStatement", consequent }
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
  int: intType,
  float: floatType,
  boolean: boolType,
  string: stringType,
  none: noneType,
  any: anyType,
})

String.prototype.type = stringType
Number.prototype.type = floatType
Boolean.prototype.type = boolType
