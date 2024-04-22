import * as core from "./core.js"

const INT = core.intType
const FLOAT = core.floatType
const STRING = core.stringType
const BOOLEAN = core.boolType
const ANY = core.anyType
const NONE = core.noneType

class Context {
  constructor({
    parent = null,
    locals = new Map(),
    inLoop = false,
    function: f = null,
  }) {
    Object.assign(this, { parent, locals, inLoop, function: f })
  }
  add(name, entity) {
    this.locals.set(name, entity)
  }
  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name)
  }
  static root() {
    return new Context({
      locals: new Map(Object.entries(core.standardLibrary)),
    })
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() })
  }
}

export default function analyze(match) {
  let context = Context.root()

  function must(condition, message, errorLocation) {
    if (!condition) {
      const prefix = errorLocation.at.source.getLineAndColumnMessage()
      throw new Error(`${prefix}${message}`)
    }
  }

  function mustNotAlreadyBeDeclared(name, at) {
    must(
      !context.lookup(name),
      `Ingredient ${name} already declared, during PEAK??`,
      at
    )
  }

  function mustHaveBeenFound(entity, name, at) {
    must(entity, `Ingredient ${name} not declared, during PEAK??`, at)
  }

  function mustHaveNumericType(e, at) {
    must(
      [INT, FLOAT].includes(e.type),
      "Expected a pump amount, I need it at the window now",
      at
    )
  }

  function mustHaveNumericOrStringType(e, at) {
    must(
      [INT, FLOAT, STRING].includes(e.type),
      "Expected a pump amount or roast name, I need it at the window now",
      at
    )
  }

  function mustHaveBooleanType(e, at) {
    must(
      e.type === BOOLEAN,
      "Expected a boolean, I need it at the window now",
      at
    )
  }

  function mustHaveIntegerType(e, at) {
    must(
      e.type === INT,
      "Expected an pump amount, I need it at the window now",
      at
    )
  }

  function mustHaveAnArrayType(e, at) {
    must(
      e.type?.kind === "ArrayType",
      "Expected an array, I need it at the window now",
      at
    )
  }

  function mustHaveAnOptionalType(e, at) {
    must(
      e.type?.kind === "OptionalType",
      "Expected an optional, I need it at the window now",
      at
    )
  }

  function mustBothHaveTheSameType(e1, e2, at) {
    must(
      equivalent(e1.type, e2.type),
      "Operands do not have the same type, its like asking for a white mocha and receiving a mocha",
      at
    )
  }

  function mustAllHaveSameType(expressions, at) {
    must(
      expressions
        .slice(1)
        .every((e) => equivalent(e.type, expressions[0].type)),
      "Not all elements have the same type",
      at
    )
  }

  function mustBeAType(e, at) {
    must(
      e?.kind.endsWith("Type"),
      "Type expected, you want a tall, grande, venti, or trenta",
      at
    )
  }

  function mustBeAnArrayType(t, at) {
    must(t?.kind === "ArrayType", "Must be an array type", at)
  }

  function equivalent(t1, t2) {
    return (
      t1 === t2 ||
      (t1?.kind === "OptionalType" &&
        t2?.kind === "OptionalType" &&
        equivalent(t1.baseType, t2.baseType)) ||
      (t1?.kind === "ArrayType" &&
        t2?.kind === "ArrayType" &&
        equivalent(t1.baseType, t2.baseType)) ||
      (t1?.kind === "FunctionType" &&
        t2?.kind === "FunctionType" &&
        equivalent(t1.returnType, t2.returnType) &&
        t1.paramTypes.length === t2.paramTypes.length &&
        t1.paramTypes.every((t, i) => equivalent(t, t2.paramTypes[i])))
    )
  }

  function assignable(fromType, toType) {
    return (
      toType == ANY ||
      equivalent(fromType, toType) ||
      (fromType?.kind === "FunctionType" &&
        toType?.kind === "FunctionType" &&
        assignable(fromType.returnType, toType.returnType) &&
        fromType.paramTypes.length === toType.paramTypes.length &&
        toType.paramTypes.every((t, i) =>
          assignable(t, fromType.paramTypes[i])
        ))
    )
  }

  function typeDescription(type) {
    switch (type.kind) {
      case "IntType":
        return "int"
      case "FloatType":
        return "float"
      case "StringType":
        return "string"
      case "BoolType":
        return "boolean"
      case "NoneType":
        return "none"
      case "AnyType":
        return "any"
      case "FunctionType":
        const paramTypes = type.paramTypes.map(typeDescription).join(", ")
        const returnType = typeDescription(type.returnType)
        return `(${paramTypes})->${returnType}`
      case "ArrayType":
        return `[${typeDescription(type.baseType)}]`
      case "OptionalType":
        return `${typeDescription(type.baseType)}?`
    }
  }

  function mustBeAssignable(e, { toType: type }, at) {
    const message = `Cannot assign a ${typeDescription(
      e.type
    )} to a ${typeDescription(type)}`
    must(assignable(e.type, type), message, at)
  }

  function mustNotBeReadOnly(e, at) {
    must(!e.readOnly, `Cannot assign to constant ${e.name}`, at)
  }

  function mustBeInLoop(at) {
    must(context.inLoop, "Tamp can only appear in a blend", at)
  }

  function mustBeInAFunction(at) {
    must(context.function, "Serve can only appear in a item", at)
  }

  function mustBeCallable(e, at) {
    const callable = e?.kind === "StructType" || e.type?.kind === "FunctionType"
    must(callable, "Call of non-function or non-constructor", at)
  }

  function mustNotReturnAnything(f, at) {
    must(f.type.returnType === NONE, "Something should be served", at)
  }

  function mustReturnSomething(f, at) {
    must(f.type.returnType !== NONE, "Cannot serve a value from this item", at)
  }

  function mustBeReturnable(e, { from: f }, at) {
    mustBeAssignable(e, { toType: f.type.returnType }, at)
  }

  function mustHaveCorrectArgumentCount(argCount, paramCount, at) {
    const message = `${paramCount} argument(s) required but ${argCount} passed`
    must(argCount === paramCount, message, at)
  }

  const analyzer = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(statements) {
      return core.program(statements.children.map((s) => s.rep()))
    },
    Statement_bump(exp, operator) {
      const variable = exp.rep()
      mustHaveIntegerType(variable, { at: exp })
      return operator.sourceString === "++"
        ? core.increment(variable)
        : core.decrement(variable)
    },
    FuncDecl(_item, id, parameters, _arrow, type, block) {
      const fun = core.fun(id.sourceString)
      mustNotAlreadyBeDeclared(id.sourceString, { at: id })
      context.add(id.sourceString, fun)
      context = context.newChildContext({ inLoop: false, function: fun })
      const params = parameters.rep()
      const paramTypes = params.map((param) => param.type)
      const returnType = type.children?.[0]?.rep() ?? NONE
      fun.type = core.functionType(paramTypes, returnType)
      const body = block.rep()
      context = context.parent
      return core.functionDeclaration(fun, params, body)
    },
    ClassDecl(_order, id, _open, field, fundecl, _close) {
      const className = id.sourceString
      mustNotAlreadyBeDeclared(className, id)
      const type = core.classType(className, [], [])
      context.add(className, type)
      context = context.newChildContext({ inClass: true })
      const fields = field.children.map((field) => field.rep())
      const methods = fundecl.children.map((fundecl) => fundecl.rep())
      context = context.parent
      type.fields = fields
      type.methods = methods
      const classDeclaration = core.classDeclaration(className, type)
      return classDeclaration
    },
    VarDecl(modifier, id, _eq, exp) {
      const initializer = exp.rep()
      const readOnly = modifier.sourceString === "const"
      const variable = core.variable(
        id.sourceString,
        readOnly,
        initializer.type
      )
      mustNotAlreadyBeDeclared(id.sourceString, { at: id })
      context.add(id.sourceString, variable)
      return core.variableDeclaration(variable, initializer)
    },
    Field(id, _colon, type) {
      return core.field(id.sourceString, type.rep())
    },
    Params(_open, paramList, _close) {
      return paramList.asIteration().children.map((p) => p.rep())
    },
    Param(id, _colon, type) {
      const param = core.variable(id.sourceString, false, type.rep())
      mustNotAlreadyBeDeclared(param.name, { at: id })
      context.add(param.name, param)
      return param
    },
    Block(_open, statements, _close) {
      return statements.children.map((s) => s.rep())
    },
    Type_array(_left, baseType, _right) {
      return core.arrayType(baseType.rep())
    },
    Type_optional(baseType, _questionMark) {
      return core.optionalType(baseType.rep())
    },
    Type_id(id) {
      const entity = context.lookup(id.sourceString)
      mustHaveBeenFound(entity, id.sourceString, { at: id })
      mustBeAType(entity, { at: id })
      return entity
    },
    Assignment(id, _eq, experssion) {
      return core.assignment(id.sourceString, experssion.rep())
    },
    VarDecl(modifier, id, _eq, exp) {
      const initializer = exp.rep()
      const readOnly = modifier.sourceString === "const"
      const variable = core.variable(
        id.sourceString,
        readOnly,
        initializer.type
      )
      mustNotAlreadyBeDeclared(id.sourceString, { at: id })
      context.add(id.sourceString, variable)
      return core.variableDeclaration(variable, initializer)
    },
    IfStmt_with_else(_brew, exp, block1, _pull, block2) {
      const test = exp.rep()
      mustHaveBooleanType(test, { at: exp })
      context = context.newChildContext()
      const consequent = block1.rep()
      context = context.parent
      context = context.newChildContext()
      const alternate = block2.rep()
      context = context.parent
      return core.ifStatement(test, consequent, alternate)
    },
    IfStmt_nested_if(_brew, exp, block, _pull, trailingIfStatement) {
      const test = exp.rep()
      mustHaveBooleanType(test, { at: exp })
      context = context.newChildContext()
      const consequent = block.rep()
      context = context.parent
      const alternate = trailingIfStatement.rep()
      return core.ifStatement(test, consequent, alternate)
    },
    IfStmt_plain_if(_brew, exp, block) {
      const test = exp.rep()
      mustHaveBooleanType(test, { at: exp })
      context = context.newChildContext()
      const consequent = block.rep()
      context = context.parent
      return core.shortIfStatement(test, consequent)
    },
    ForStmt(_ristretto, id, _espresso, exp, block) {
      const collection = exp.rep()
      mustHaveAnArrayType(collection, { at: exp })
      const iterator = core.variable(
        id.sourceString,
        true,
        collection.type.baseType
      )
      context = context.newChildContext({ inLoop: true })
      context.add(iterator.name, iterator)
      const body = block.rep()
      context = context.parent
      return core.forStatement(iterator, collection, body)
    },
    WhileStmt(_while, exp, block) {
      return core.whileStatement(exp.rep(), block.rep())
    },
    BreakStmt(_break) {
      mustBeInLoop({ at: _break })
      return core.breakStatement()
    },
    PrintStmt(_print, exp) {
      return core.printStatement(exp.rep())
    },
    ReturnStmt(returnKeyword, exp) {
      mustBeInAFunction({ at: returnKeyword })
      mustReturnSomething(context.function, { at: returnKeyword })
      const returnExpression = exp.rep()
      mustBeReturnable(
        returnExpression,
        { from: context.function },
        { at: exp }
      )
      return core.returnStatement(returnExpression)
    },
    Exp_conditional(exp, _questionMark, exp1, colon, exp2) {
      const test = exp.rep()
      mustHaveBooleanType(test, { at: exp })
      const [consequent, alternate] = [exp1.rep(), exp2.rep()]
      mustBothHaveTheSameType(consequent, alternate, { at: colon })
      return core.conditional(test, consequent, alternate, consequent.type)
    },
    Exp0_or(exp1, _or, exp2) {
      let left = exp1.rep()
      mustHaveBooleanType(left, { at: exp1 })
      for (let e of exp2.children) {
        let right = e.rep()
        mustHaveBooleanType(right, { at: e })
        left = core.binary("or", left, right, BOOLEAN)
      }
      return left
    },
    Exp1_and(exp1, _and, exp2) {
      let left = exp1.rep()
      mustHaveBooleanType(left, { at: exp1 })
      for (let e of exp2.children) {
        let right = e.rep()
        mustHaveBooleanType(right, { at: e })
        left = core.binary("and", left, right, BOOLEAN)
      }
      return left
    },
    Exp2_relop(exp1, relop, exp2) {
      const [left, op, right] = [exp1.rep(), relop.sourceString, exp2.rep()]
      if (["<", "<=", ">", ">="].includes(op)) {
        mustHaveNumericOrStringType(left, { at: exp1 })
      }
      mustBothHaveTheSameType(left, right, { at: relop })
      return core.binary(op, left, right, BOOLEAN)
    },
    Exp3_addsub(exp1, addOp, exp2) {
      const [left, op, right] = [exp1.rep(), addOp.sourceString, exp2.rep()]
      if (op === "+") {
        mustHaveNumericOrStringType(left, { at: exp1 })
      } else {
        mustHaveNumericType(left, { at: exp1 })
      }
      mustBothHaveTheSameType(left, right, { at: addOp })
      return core.binary(op, left, right, left.type)
    },
    Term_muldivmod(exp1, mulOp, exp2) {
      const [left, op, right] = [exp1.rep(), mulOp.sourceString, exp2.rep()]
      mustHaveNumericType(left, { at: exp1 })
      mustBothHaveTheSameType(left, right, { at: mulOp })
      return core.binary(op, left, right, left.type)
    },
    Factor_power(exp1, powerOp, exp2) {
      const [left, op, right] = [exp1.rep(), powerOp.sourceString, exp2.rep()]
      mustHaveNumericType(left, { at: exp1 })
      mustBothHaveTheSameType(left, right, { at: powerOp })
      return core.binary(op, left, right, left.type)
    },
    Factor_unary(unaryOp, exp) {
      const [op, operand] = [unaryOp.sourceString, exp.rep()]
      let type
      if (op === "-") {
        mustHaveNumericType(operand, { at: exp })
        type = operand.type
      } else if (op === "not") {
        mustHaveBooleanType(operand, { at: exp })
        type = BOOLEAN
      }
      return core.unary(op, operand, type)
    },
    Primary_call(exp, open, expList, _close) {
      const callee = exp.rep()
      mustBeCallable(callee, { at: exp })
      const exps = expList.asIteration().children
      const targetTypes = callee.type.paramTypes
      mustHaveCorrectArgumentCount(exps.length, targetTypes.length, {
        at: open,
      })
      const args = exps.map((exp, i) => {
        const arg = exp.rep()
        mustBeAssignable(arg, { toType: targetTypes[i] }, { at: exp })
        return arg
      })
      return core.call(callee, args)
    },
    Primary_subscript(exp1, _open, exp2, _close) {
      const [array, subscript] = [exp1.rep(), exp2.rep()]
      mustHaveAnArrayType(array, { at: exp1 })
      mustHaveIntegerType(subscript, { at: exp2 })
      return core.subscript(array, subscript)
    },
    Primary_member(exp, dot, id) {
      const object = exp.rep()
      let structType
      if (dot.sourceString === "?.") {
        mustHaveAnOptionalStructType(object, { at: exp })
        structType = object.type.baseType
      } else {
        mustHaveAStructType(object, { at: exp })
        structType = object.type
      }
      mustHaveMember(structType, id.sourceString, { at: id })
      const field = structType.fields.find((f) => f.name === id.sourceString)
      return core.memberExpression(object, dot.sourceString, field)
    },
    Primary_emptyarray(ty, _open, _close) {
      const type = ty.rep()
      mustBeAnArrayType(type, { at: ty })
      return core.emptyArray(type)
    },
    Primary_arrayexp(_open, args, _close) {
      const elements = args.asIteration().children.map((e) => e.rep())
      mustAllHaveSameType(elements, { at: args })
      return core.arrayExpression(elements)
    },
    Primary_parens(_open, expression, _close) {
      return expression.rep()
    },
    Primary_id(id) {
      const entity = context.lookup(id.sourceString)
      mustHaveBeenFound(entity, id.sourceString, { at: id })
      return entity
    },
    true(_) {
      return true
    },
    false(_) {
      return false
    },
    int(_digits) {
      return BigInt(this.sourceString)
    },
    string(_openQuote, _chars, _closeQuote) {
      return this.sourceString
    },
    num(_whole, _point, _fraction, _e, _sign, _exponent) {
      return Number(this.sourceString)
    },
  })

  return analyzer(match).rep()
}
