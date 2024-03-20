import * as core from "./core.js"

export default function analyze(match) {
  const analyzer = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(statements) {
      return new core.Program(statements.children.map((s) => s.rep()))
    },
    FuncDecl(_item, id, params, type, block) {},
    ClassDecl(_order, id, _open, constructor, fundecl, _close) {},
    Constructor(_hopper, params, initconst) {},
    InitConst(_shot, id, exp) {},
    ObjDecl(id, id, _new, id) {},
    Params(paramList) {},
    Param(id, _colon, type) {},
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
    VarDecl(modifier, id, _eq, exp) {},
    IfStmt_with_else(_brew, exp, block, _pull, block) {},
    IfStmt_nested_if(_else, stmt) {},
    IfStmt_plain_if(_else, block) {},
    ForStmt() {},
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
