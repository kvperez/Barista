import assert from "node:assert/strict"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"

// Programs that are semantically correct
const semanticChecks = [
  ["variable declarations", 'const x = 1 let y = "false"'],
  ["variable assignments", "let x = 2  x = 10"],
  ["print statement", 'item f() -> roast {remake "Hello World!"}'],
  ["increment and decrement", "let x = 10 x-- x++"],
  ["initialize with empty array", "let a = [pump]()"],
  ["assign arrays", "let a = [1]"],
  ["assign to array element", "const a = [1,2,3] a[1] = 100"],
  ["return", "item f() -> pump { serve 0 }"],
  ["return in nested if", "item f() -> pump {brew true {serve 0 }}"],
  ["break in nested if", "blend false {brew true {tamp}}"],
  ["long if", "brew true {remake 1} pull { remake 3}"],
  ["elsif", "brew true {remake 1} pull brew true {remake 1} pull {remake 3}"],
  ["for over collection", "ristretto i espresso [2,3,5] {remake 0}"],
  ["conditionals with ints", "remake true ? 8 : 5"],
  ["conditionals with floats", "remake 1<2 ? 8.0 : -5.22"],
  ["conditionals with strings", 'remake 1<2 ? "x" : "y"'],
  ["or", "remake true or 1<2 or false or not true"],
  ["and", "remake true and 1<2 and false and not true"],
  ["relations", 'remake 1<=2 and "x">"y" and 3.5<1.2'],
  ["ok to == arrays", "remake [1]==[5,8]"],
  ["ok to != arrays", "remake [1]!=[5,8]"],
  ["arithmetic", "let x=1 remake 2*3+5**-3/2-5%8"],
  ["variables", "let x=[[[[1]]]] remake x[0][0][0][0]+2"],
  ["subscript exp", "let a=[1,2] remake a[0]"],
  ["assigned functions", "item f() -> none {}\nlet g = f g = f"],
  ["call of assigned functions", "item f(x: pump) -> none {}\nlet g=f g(1)"],
  [
    "type equivalence of nested arrays",
    "item f(x: [[pump]]) -> none {} remake f([[1],[2]])",
  ],
  [
    "call of assigned function in expression",
    `item f(x: pump, y: boolean) -> pump {}
    let g = f
    remake g(1, true)
    f = g // Type check here`,
  ],
  ["function return types", `item square(x: pump) -> pump { serve x * x }`],
  ["array parameters", "item f(x: [pump?]) -> none {}"],
  ["optional parameters", "item f(x: [pump], y: roast?) -> none {}"],
  ["outer variable", "let x=1 blend false {remake 1}"],
  [
    "class declaration",
    'order Car { name: roast year: pump item carMaker() -> pump {let name = "myCar" let year = 2024 let vroom = year + 3 serve vroom }} ',
  ],
  ["call a function", "item f(x: pump) -> none {} f(1)"],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  [
    "no field",
    'order Car { name: roast year: pump item carMaker() -> none { let name = "myCar" let year = 2024 let vroom = year + 3 serve vroom }}',
    /Cannot serve a value/,
  ],
  ["non-int increment", "let x=false x++", /Expected a pump/],
  ["non-int decrement", "let x=false x--", /Expected a pump/],
  ["undeclared id", "remake x", /Ingredient x not declared/],
  ["redeclared id", "let x = 1 let x = 1", /Ingredient x already declared/],
  ["assign to const", "const x = 1 x = 2", /Cannot assign to constant/],
  ["assign bad type", "let x=1 x=true", /Cannot assign a boolean to a pump/],
  [
    "assign bad array type",
    "let x=1 x=[true]",
    /Cannot assign a \[boolean\] to a pump/,
  ],
  ["break outside loop", "tamp", /Tamp can only appear in a blend/],
  [
    "break inside function",
    "blend true {item f() -> none {tamp}}",
    /Tamp can only appear in a blend/,
  ],
  ["return outside function", "serve 0", /Serve can only appear in an item/],
  [
    "return value from void function",
    "item f() -> none {serve 1}",
    /Cannot serve a value/,
  ],
  [
    "return type mismatch",
    "item f() -> pump {serve false}",
    /boolean to a pump/,
  ],
  ["non-boolean short if test", "brew 1 {}", /Expected a boolean/],
  ["non-boolean if test", "brew 1 {} pull {}", /Expected a boolean/],
  ["non-boolean while test", "blend 1 {}", /Expected a boolean/],
  ["non-array in for", "ristretto i espresso 100 {}", /Expected an array/],
  ["non-boolean conditional test", "remake 1?2:3", /Expected a boolean/],
  ["bad types for or", "remake false or 1", /Expected a boolean/],
  ["bad types for and", "remake false and 1", /Expected a boolean/],
  ["bad types for ==", "remake false==1", /Operands do not have the same type/],
  [
    "bad types for !=",
    "remake false==1 ",
    /Operands do not have the same type/,
  ],
  ["bad types for +", "remake false+1", /Expected a pump or roast/],
  ["bad types for -", "remake false-1", /Expected a pump/],
  ["bad types for *", "remake false*1", /Expected a pump/],
  ["bad types for /", "remake false/1", /Expected a pump/],
  ["bad types for **", "remake false**1", /Expected a pump/],
  ["bad types for <", "remake false<1", /Expected a pump or roast/],
  ["bad types for <=", "remake false<=1", /Expected a pump or roast/],
  ["bad types for >", "remake false>1", /Expected a pump or roast/],
  ["bad types for >=", "remake false>=1", /Expected a pump or roast/],
  ["bad types for !=", "remake false!=1", /not have the same type/],
  ["bad types for negation", "remake -true", /Expected a pump/],
  ["non-integer index", "let a=[1] remake a[false]", /Expected a pump/],
  [
    "shadowing",
    "let x = 1\nblend true {let x = 1}",
    /Ingredient x already declared/,
  ],
  ["call of uncallable", "let x = 1\nremake x()", /Call of non-function/],
  [
    "too many args",
    "item f(x: pump) -> none {}\nf(1,2)",
    /1 argument\(s\) required but 2 passed/,
  ],
  [
    "too few args",
    "item f(x: pump) -> none {}\nf()",
    /1 argument\(s\) required but 0 passed/,
  ],
  [
    "Parameter type mismatch",
    "item f(x: pump) -> none {}\nf(false)",
    /Cannot assign a boolean to a pump/,
  ],
  // [
  //   "bad return type in fn assign",
  //   'function f(x: int): int {return 1;} function g(y: int): string {return "uh-oh";} f = g;',
  //   /Cannot assign a \(int\)->string to a \(int\)->int/,
  // ],
  // ["Non-type in param", "let x=1;function f(y:x){}", /Type expected/],
  // [
  //   "Non-type in return type",
  //   "let x=1;function f():x{return 1;}",
  //   /Type expected/,
  // ],
]

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern)
    })
  }
})
