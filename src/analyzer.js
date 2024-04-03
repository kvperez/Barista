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
    must(!context.lookup(name), `Identifier ${name} already declared`, at)
  }

  function mustHaveBeenFound(entity, name, at) {
    must(entity, `Identifier ${name} not declared`, at)
  }

  function mustHaveNumericType(e, at) {
    must([INT, FLOAT].includes(e.type), "Expected a pump", at)
  }

  function mustHaveNumericOrStringType(e, at) {
    must([INT, FLOAT, STRING].includes(e.type), "Expected a pump or roast", at)
  }

  function mustHaveBooleanType(e, at) {
    must(e.type === BOOLEAN, "Expected a boolean", at)
  }

  function mustHaveIntegerType(e, at) {
    must(e.type === INT, "Expected an pump", at)
  }

  function mustHaveAnArrayType(e, at) {
    must(e.type?.kind === "ArrayType", "Expected an array", at)
  }

  function mustHaveAnOptionalType(e, at) {
    must(e.type?.kind === "OptionalType", "Expected an optional", at)
  }

  function mustBothHaveTheSameType(e1, e2, at) {
    must(equivalent(e1.type, e2.type), "Operands do not have the same type", at)
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
    must(e?.kind.endsWith("Type"), "Type expected", at)
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
      case "StructType":
        return type.name
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

  function mustHaveDistinctFields(type, at) {
    const fieldNames = new Set(type.fields.map((f) => f.name))
    must(fieldNames.size === type.fields.length, "Fields must be distinct", at)
  }

  function mustHaveMember(structType, field, at) {
    must(
      structType.fields.map((f) => f.name).includes(field),
      "No such field",
      at
    )
  }

  function mustBeInLoop(at) {
    must(context.inLoop, "Tamp can only appear in a loop", at)
  }

  function mustBeInAFunction(at) {
    must(context.function, "Serve can only appear in a function", at)
  }

  function mustBeCallable(e, at) {
    const callable = e?.kind === "StructType" || e.type?.kind === "FunctionType"
    must(callable, "Call of non-function or non-constructor", at)
  }

  function mustNotReturnAnything(f, at) {
    must(f.type.returnType === NONE, "Something should be returned", at)
  }

  function mustReturnSomething(f, at) {
    must(
      f.type.returnType !== NONE,
      "Cannot serve a value from this function",
      at
    )
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
      return new core.Program(statements.children.map((s) => s.rep()))
    },
    FuncDecl(_item, id, params, type, block) {},
    ClassDecl(_order, id, _open, constructor, fundecl, _close) {},
    Constructor(_hopper, params, initconst) {},
    InitConst(_shot, id, exp) {},
    ObjDecl(id, id, _new, id) {},
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
    Params(paramList) {
      return paramList.asIteration().children.map((p) => p.rep())
    },
    Param(id, _colon, type) {
      const param = core.variable(id.sourceString, false, type.rep())
      mustNotAlreadyBeDeclared(param.name, { at: id })
      context.add(param.name, param)
      return param
    },
    Block(_open, stmt, _close) {
      return statements.children.map((s) => s.rep())
    },
    Type_array(_left, baseType, _right) {
      return core.arrayType(baseType.rep())
    },
    Type_dictionary() {},
    Type_optional(baseType, _questionMark) {
      return core.optionalType(baseType.rep())
    },
    Type_function(_left, types, _right, _arrow, type) {
      const paramTypes = types.asIteration().children.map((t) => t.rep())
      const returnType = type.rep()
      return core.functionType(paramTypes, returnType)
    },
    Type_id(id) {
      const entity = context.lookup(id.sourceString)
      mustHaveBeenFound(entity, id.sourceString, { at: id })
      mustBeAType(entity, { at: id })
      return entity
    },
    Type_none() {},
    Assignment(id, _eq, experssion) {
      return new core.Assignment(id.sourceString, experssion.rep())
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
    ForStmt(_ristretto, exp, _espresso, exp, block) {},
    WhileStmt(_while, exp, block) {
      return new core.WhileStatement(exp.rep(), block.rep())
    },
    CallStmt() {},
    Call() {},
    Args() {},
    BreakStmt(_break) {
      return new core.BreakStatement()
    },
    PrintStmt(_print, exp) {
      return new core.PrintStatement(exp.rep())
    },
    ReturnStmt() {},
    DotCall() {},
    Exp_unary() {},
    Exp0_or() {},
    Exp1_and() {},
    Exp2_relop() {},
    Exp3_addsub() {},
    Term_muldivmod() {},
    Factor_power() {},
    Primary_params() {},
    Primary_array() {},
    Primary_subscript() {},
    Primary_number() {},
    stringlit(_openQuote, _chars, _closeQuote) {
      return this.sourceString
    },
    // Exp_comparison(left, op, right) {
    //   return new core.BinaryExpression(op.sourceString, left.rep(), right.rep())
    // },
    // Exp1_binary(left, op, right) {
    //   return new core.BinaryExpression(op.sourceString, left.rep(), right.rep())
    // },
    // Term_binary(left, op, right) {
    //   return new core.BinaryExpression(op.sourceString, left.rep(), right.rep())
    // },
    // Factor_binary(left, op, right) {
    //   return new core.BinaryExpression(op.sourceString, left.rep(), right.rep())
    // },
    // Factor_negation(op, operand) {
    //   return new core.UnaryExpression(op.sourceString, operand.rep())
    // },
    // Primary_call(id, _open, args, _close) {},
    // Primary_parens(_open, exp, _close) {
    //   return new exp.rep()
    // },
    // Primary_id(id) {
    //   return new core.Variable(id.sourceString)
    // },
    // numeral(_main, _dot, _fract, _e, _sign, _exp) {
    //   return Number(this.sourceString)
    // },
  })

  return analyzer(match).rep()
}
