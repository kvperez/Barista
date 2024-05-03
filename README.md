<img src=./docs/barista.png width="500" height="500">

# [Barista](https://kvperez.github.io/barista)

A programming language inspired by common terminology I use as a Starbucks Partner. This programming language allows Baristas to explore further than the Pike Place Roast, while maintaining focus on commonly used terms known to coffee brewers. With expertise in this language, Baristas will get an embroidered logo on their Apron or Coffee Master Apron. Baristas will be allowed to continue their _customer connections_ on the web.

By: Kevin Perez

## Features

- Barista Terminology
- Statitc Typing
- Uses JavaScript and some Python
- Classes
- Loops

## Examples

### Hello World

<table>
<tr> <th>Barista</th><th>JavaScript</th><tr>
</tr>
<td>

```
remake “Hello Baristas!”
```

</td>
<td>

```javascript
console.log(“Hello Baristas!”)
```

</td>
</table>

### Classes

<table>
<tr> <th>Barista</th><th>JavaScript</th><tr>
</tr>
<td>

```
order Car {
  name: roast
  year: pump

  item carMaker() -> pump {
    let year = 2024
    let vroom = year + 3
    serve vroom
  }
}
```

</td>
<td>

```javascript
class Car {
  constructor(name, year) {
    this.name = name
    this.year = year
  }
  carMaker() {
    this.year = 2024
    let vroom = this.year + 3
    return vroom
  }
}
```

</td>
</table>

### For Loop

<table>
<tr> <th>Barista</th><th>JavaScript</th><tr>
</tr>
<td>

```
item array() -> pump {
  let x = [2,3,5]
  ristretto i espresso x {
    brew i == 1 {
      serve x[i]
    }
  }
}
```

</td>
<td>

```javascript
function array() {
  let x = [2, 3, 5]
  for (let i = 0; i < x.length; i++) {
    if (i === 1) {
      return x[i]
    }
  }
}
```

</td>
</table>

### While Loop

<table>
<tr> <th>Barista</th><th>JavaScript</th><tr>
</tr>
<td>

```
item counter() -> pump {
  let count = 0
  blend count < 5 {
    count++
  }
  serve count
}
```

</td>
<td>

```javascript
function counter() {
  let count = 0
  while (count < 5) {
    count++
  }
  return count
}
```

</td>
</table>

### Function

<table>
<tr> <th>Barista</th><th>JavaScript</th><tr>
</tr>
<td>

```
item carGen(name: roast, car: pump) -> pump {
  let vroom = car + 3
  name = "MyCar"
  serve vroom
}
```

</td>
<td>

```javascript
function carGen(name, car) {
  let vroom = car + 3
  name = "MyCar"
  return vroom
}
```

</td>
</table>

### Types of Semantic Errors

- Non-initialized variables
- Incrementing and decrementing with non-int variable types
- Operands that do not have same type
- Incorrect number of item (function) parameters
- None return type has a serve (return) value
- Pump return type has a remake (print) value
- Break outside of blend (loop)
- Return outside of a item (function)
- Function with return value doesn't return anything
- Calling a function that is not intialized
