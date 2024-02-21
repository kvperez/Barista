<img src=./docs/barista.png width="500" height="500">

# Barista

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
remake “Hello World!”
```

</td>
<td>

```javascript
console.log(“Hello World!”)
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
  hopper (name: roast, year: pump) {
    shot.name = name
    shot.year = year
  }

  item getYear() -> pump {
    serve shot.year
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
  getYear() {
    return this.year
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
item returnNegativeOne(x: array) -> pump {
  ristretto y espresso x {
    serve -1
  }
}
```

</td>
<td>

```javascript
function returnNegativeOne(x) {
  for (let i = 0; i < x; i++) {
    return -1
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
item while() -> none {
  let x = 0
  let y = 1

  blend x < y {
    remake "Less Than"
    x++
  }
}
```

</td>
<td>

```javascript
function whileBreak(x) {
  while (true) {
    console.log("WHILE STATEMENT")
    break
  }
}
```

</td>
</table>

### Fibonacci

<table>
<tr> <th>Barista</th><th>JavaScript</th><tr>
</tr>
<td>

```
item fibonacci(x: pump) -> pump {
  brew x <= 1 {
    serve x
  }
  pull {
    serve fibonacci(x - 1) + fibonacci(x - 2)
  }
}
```

</td>
<td>

```javascript
function fibonacci(x) {
  if (x <= 1) {
    return x
  } else {
    return fibonacci(x - 1) + fibonacci(x - 2)
  }
}
```

</td>
</table>
