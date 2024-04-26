import assert from "node:assert/strict"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const fixtures = [
  {
    name: "very small",
    source: `
      let x = 20
      x = 40
      remake x
    `,
    expected: dedent`
      let x_1 = 20;
      x_1 = 40;
      console.log(x_1);
    `,
  },
  {
    name: "small",
    source: `
      let x = 21
      x++
      x++
      x--
      remake x
    `,
    expected: dedent`
      let x_1 = 21;
      x_1++;
      x_1++;
      x_1--;
      console.log(x_1);
    `,
  },
  {
    name: "if",
    source: `
      let x = 0
      brew x == 0 { remake "1" }
      brew x == 0 { remake 1 } pull { remake 2 }
      brew x == 0 { remake 1 } pull brew x == 2 { remake 3 }
      brew x == 0 { remake 1 } pull brew x == 2 { remake 3 } pull { remake 4}
    `,
    expected: dedent`
      let x_1 = 0;
      if ((x_1 === 0)) {
        console.log("1");
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else {
        console.log(2);
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else
        if ((x_1 === 2)) {
          console.log(3);
        }
      if ((x_1 === 0)) {
        console.log(1);
      } else
        if ((x_1 === 2)) {
          console.log(3);
        } else {
          console.log(4);
        }
      
    `,
  },
  {
    name: "while",
    source: `
      let x = 0
      blend x < 5 {
        let y = 0
        blend y < 5 {
          remake x * y
          y = y + 1
          tamp
        }
        x = x + 1
      }
    `,
    expected: dedent`
      let x_1 = 0;
      while ((x_1 < 5)) {
        let y_2 = 0;
        while ((y_2 < 5)) {
          console.log((x_1 * y_2));
          y_2 = (y_2 + 1);
          break;
        }
        x_1 = (x_1 + 1);
      }
    `,
  },
  {
    name: "functions",
    source: `
      let z = 0.5
      let w = false
      item f(x: pump, y: boolean) -> pump {
        brew y == false {
          serve x
        }
      }
    `,
    expected: dedent`
      let z_1 = 0.5;
      let w_2 = false;
      function f_3(x_4, y_5) {
        if ((y_5 === false)) {
          return x_4;
        }
      }
    `,
  },
  {
    name: "for loop",
    source: `
      ristretto j espresso [10, 20, 30] {
        remake j
      }
    `,
    expected: dedent`
      for (let j_1 of [10,20,30]) {
        console.log(j_1);
      }
    `,
  },
  {
    name: "call function",
    source: `
      item f(x: pump) -> pump {
        serve x
      }
      remake f(1)
    `,
    expected: dedent`
      function f_1(x_2) {
        return x_2;
      }
      console.log(f_1(1));
    `,
  },
  {
    name: "arrays",
    source: `
      let a = [true, false, true]
      remake a[1]
    `,
    expected: dedent`
      let a_1 = [true, false, true];
      console.log(a_1[1]);
    `,
  },
  {
    name: "class",
    source: `
    order x { 
      y: roast 
    
      item z() -> none {
        let y = "Hi"
        remake y
      }
    }
    `,
    expected: dedent`
    class x_1 {
      constructor(y_2) {
        this["y_2"] = y_2;
      }
      z_3() {
        let y_2 = "Hi"
        console.log(this["y_2"])
      }
    }
    `,
  },
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(parse(fixture.source))))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})
