import { noneType } from "./core.js"

export default function generate(program) {
  const output = []

  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name}_${mapping.get(entity)}`
    }
  })(new Map())

  const gen = (node) => generators?.[node?.kind]?.(node) ?? node

  const generators = {
    Program(p) {
      p.statements.forEach(gen)
    },
    VariableDeclaration(d) {
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`)
    },
    PrintStatement(p) {
      output.push(`console.log(${gen(p.expression)});`)
    },
    Field(f) {
      return targetName(f)
    },
    FunctionDeclaration(d) {
      output.push(`function ${gen(d.fun)}(${d.params.map(gen).join(", ")}) {`)
      d.body.forEach(gen)
      output.push("}")
    },
    Variable(v) {
      return targetName(v)
    },
    Function(f) {
      return targetName(f)
    },
    Increment(s) {
      output.push(`${gen(s.variable)}++;`)
    },
    Decrement(s) {
      output.push(`${gen(s.variable)}--;`)
    },
    Assignment(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`)
    },
    BreakStatement(s) {
      output.push("break;")
    },
    ReturnStatement(s) {
      output.push(`return ${gen(s.expression)};`)
    },
    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      s.consequent.forEach(gen)
      if (s.alternate?.kind?.endsWith?.("IfStatement")) {
        output.push("} else")
        gen(s.alternate)
      } else {
        output.push("} else {")
        s.alternate.forEach(gen)
        output.push("}")
      }
    },
    ElseIfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      s.consequent.forEach(gen)
      output.push("}")
    },
    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`)
      s.body.forEach(gen)
      output.push("}")
    },
    ForStatement(s) {
      output.push(`for (let ${gen(s.iterator)} of ${gen(s.collection)}) {`)
      s.body.forEach(gen)
      output.push("}")
    },
    Conditional(e) {
      return `((${gen(e.test)}) ? (${gen(e.consequent)}) : (${gen(
        e.alternate
      )}))`
    },
    BinaryExpression(e) {
      const op = { "==": "===", "!=": "!==" }[e.op] ?? e.op
      return `(${gen(e.left)} ${op} ${gen(e.right)})`
    },
    // UnaryExpression(e) {
    //   const operand = gen(e.operand)
    //   if (e.op === "some") {
    //     return operand
    //   } else if (e.op === "#") {
    //     return `${operand}.length`
    //   } else if (e.op === "random") {
    //     return `((a=>a[~~(Math.random()*a.length)])(${operand}))`
    //   }
    //   return `${e.op}(${operand})`
    // },
    EmptyOptional(e) {
      return "undefined"
    },
    SubscriptExpression(e) {
      return `${gen(e.array)}[${gen(e.index)}]`
    },
    ArrayExpression(e) {
      return `[${e.elements.map(gen).join(",")}]`
    },
    EmptyArray(e) {
      return "[]"
    },
    MemberExpression(e) {
      const object = gen(e.object)
      const field = JSON.stringify(gen(e.field))
      const chain = e.op === "." ? "" : e.op
      return `(${object}${chain}[${field}])`
    },
    FunctionCall(c) {
      const targetCode = standardFunctions.has(c.callee)
        ? standardFunctions.get(c.callee)(c.args.map(gen))
        : `${gen(c.callee)}(${c.args.map(gen).join(", ")})`
      // Calls in expressions vs in statements are handled differently
      if (c.callee.type.returnType !== noneType) {
        return targetCode
      }
      output.push(`${targetCode};`)
    },
    ConstructorCall(c) {
      return `new ${gen(c.callee)}(${c.args.map(gen).join(", ")})`
    },
  }

  gen(program)
  return output.join("\n")
}
