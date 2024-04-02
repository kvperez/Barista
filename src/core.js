export class Program {
  constructor(statements, declaration) {
    Object.assign(this, { statements, declaration })
  }
}

// export class Type {
//   static BOOLEAN = new Type("boolean")
//   static INT = new Type("pump")
//   static FLOAT = new Type("affogato")
//   static STRING = new Type("roast")
//   static NONE = new Type("none")
//   static ANY = new Type("any")
//   constructor(description) {
//     Object.assign(this, { description })
//   }
// }

export class FunctionDeclaration {
  // Example: function f(x: [int?], y: string): Vector {}
  constructor(fun, params, body) {
    Object.assign(this, { fun, params, body })
  }
}

export class Function {
  // Generated when processing a function declaration
  constructor(name, type) {
    Object.assign(this, { name, type })
  }
}

// IS THIS CORRECT?
export class FunctionType {
  constructor(paramTypes, returnType) {
    Object.assign(this, { paramTypes, returnType })
  }
}

export class ClassDeclaration {
  constructor(id, constructor, fun) {
    Object.assign(this, { id, constructor, fun })
  }
}

export class Constructor {
  constructor(params, body) {
    Object.assign(this, { params, body })
  }
}

export class InitializeConstructor {
  constructor(variable, initializer) {
    Object.assign(this, { variable, initializer })
  }
}

export class ObjectDeclaration {
  // !!!!! COMPLETE THIS !!!!!
}

export class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}

export class VariableDeclaration {
  constructor(variable, initializer) {
    Object.assign(this, { variable, initializer })
  }
}

export class Variable {
  constructor(name) {
    Object.assign(this, { name })
  }
}

export class Increment {
  constructor(variable) {
    this.variable = variable
  }
}

export class Decrement {
  constructor(variable) {
    this.variable = variable
  }
}
export class Conditional {
  constructor(test, consequent, alternate, type) {
    Object.assign(this, { test, consequent, alternate, type })
  }
}

export class IfStatement {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate })
  }
}

export class ForStatement {
  constructor(iterator, collection, body) {
    Object.assign(this, { iterator, collection, body })
  }
}

export class WhileStatement {
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

export class CallStatement {
  // !!!!! COMPLETE THIS !!!!!
}

export class BreakStatement {}

export class PrintStatement {
  constructor(argument) {
    this.argument = argument
  }
}

export class ReturnStatement {
  constructor(expression) {
    this.expression = expression
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand })
  }
}
