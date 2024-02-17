import assert from "node:assert/strict"
import parse from "../src/parser.js"

const syntaxChecks = [
  ["all numeric literal forms", "remake 8 * 89.123"],
  ["complex expressions", "remake 83 * ((((-((((13 / 21)))))))) + 1 - 0"],
  ["end of program inside comment", "remake 0 // yay"],
  [
    "class declaration",
    "order Car {hopper (roast name, pump year) {shot.name = name shot.year = year} item getYear() -> pump { serve shot.year}}",
  ],
  ["a new constructor", 'Car myCar = new Car("Ford", 2014)'],
  ["calling a constructor method", 'remake myCar.getYear() + "years old"'],
  ["brew statement", "brew x <= 1 {serve x}"],
  ["brew pull statement", "brew x <= 1 {serve x} pull {serve 0}"],
  [
    "brew pull brew statement",
    "brew x <= 1 and y > 2 {serve x + y} pull brew x == 1 and y == 2 {serve x} pull {serve 0}",
  ],
  ["ristretto statement", "ristretto rock espresso mountain {rock++} "],
  ["blend statement", "blend true {i-- tamp}"],
  ["non-Latin letters in identifiers", "コンパイラ = 100"],
  ["comments with no text are ok", "remake 1 //\nremake 0//"],
  ["variable declaration", " let counter = 10"],
  ["all binary operators", "remake z * 1 / 2 ** 3 + 4 < 5"],
  ["all relational operators", "let x = 1<(2<=(3==(4!=(5 >= (6>7)))))"],
  ["all arithmetic operators", "let x = 2 + 4 - (-7.3) * 8 ** 13 / 4"],
  ["all logical operators", "let x = true and false or (not false)"],
  ["the conditional operator", "remake x ? y : z"],
  [
    "function declaration",
    'item helloWorld() -> roast {remake "Hello World!"}',
  ],
]

const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c = 2", /Line 1, col 3/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["a missing right operand", "remake 5 -", /Line 1, col 11/],
  ["a non-operator", "remake 7 * (2 _ 3)", /Line 1, col 15/],
  ["an expression starting with a )", "x = )", /Line 1, col 5/],
  ["a statement starting with expression", "x * 5", /Line 1, col 3/],
  ["an illegal statement on line 2", "remake 5\nx * 5", /Line 2, col 3/],
  ["a statement starting with a )", "remake 5\n) * 5", /Line 2, col 1/],
  ["an expression starting with a *", "x = * 71", /Line 1, col 5/],
  ["an expression ends with a ;", "serve integer;"],
  [
    "a function with no return type",
    "item returnType() { serve -1}",
    /Line 1, col 19/,
  ],
  [
    "a missing } in a brew statement",
    "brew x <= 1 { serve x ",
    /Line 1, col 23/,
  ],
  [
    "a missing } in a brew pull statement",
    "brew x <= 1 { serve x } pull { serve -1",
    /Line 1, col 40/,
  ],
  ["a missing { in a blend statement", "blend true tamp }", /Line 1, col 12/],
  ["a class declaration without constructor", "order Car {}", /Line 1, col 12/],
  [
    "a method declaration without hopper",
    "order Car { item getYear() -> pump { serve shot.year}",
    /Line 1, col 13/,
  ],
]

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(parse(source).succeeded())
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      assert.throws(() => parse(source), errorMessagePattern)
    })
  }
})
