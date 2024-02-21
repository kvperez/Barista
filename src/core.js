export class Program {
  constructor(statements, declaration) {
    Object.assign(this, { statements, declaration })
  }
}

export class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}

export class PrintStatement {
  constructor(argument) {
    this.argument = argument
  }
}

export class IfStatement {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate })
  }
}
export class WhileStatement {
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

export class BreakStatement {}

export class Variable {
  constructor(name) {
    Object.assign(this, { name })
  }
}

export class Function {
  constructor(name, params, body) {
    Object.assign(this, { name, params, body })
  }
}

export class IntrinsicFunction {
  constructor(name, parameterCount) {
    Object.assign(this, { name, parameterCount })
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
