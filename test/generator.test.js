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
    name: "small",
    source: `
      let x = 3 * 7
      x++
      x--
      let y = true
      y = 5 ** -x / -100 > - x or false
      remake (y && y) or false or (x*2) != 5
    `,
    expected: dedent`
      let x_1 = 21;
      x_1++;
      x_1--;
      let y_2 = true;
      y_2 = (((5 ** -(x_1)) / -(100)) > -(x_1));
      console.log(((y_2 && y_2) || ((x_1 * 2) !== 5)));
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
      item f(x: pump, y: boolean) -> none {
        remake x
        serve
      }
      item g() -> boolean {
        serve false
      }
      f(z, g())
    `,
    expected: dedent`
      let z_1 = 0.5;
      function f_2(x_3, y_4) {
        console.log((Math.sin(x_3) > Math.PI));
        return;
      }
      function g_5() {
        return false;
      }
      f_2(z_1, g_5());
    `,
  },
  {
    name: "arrays",
    source: `
      let a = [true, false, true]
      let b = [10, #a - 20, 30]
      const c = [[int]]()
      remake a[1] or (b[0] < 88 ? false : true)
    `,
    expected: dedent`
      let a_1 = [true,false,true];
      let b_2 = [10,(a_1.length - 20),30];
      let c_3 = [];
      let d_4 = ((a=>a[~~(Math.random()*a.length)])(b_2));
      console.log((a_1[1] || (((b_2[0] < 88)) ? (false) : (true))));
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
      for (let j_2 of [10,20,30]) {
        console.log(j_2);
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
