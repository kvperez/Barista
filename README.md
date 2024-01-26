<img src=./docs/barista.png width="500" height="500">

# Barista

A compiler for Starbucks Partners

## Examples

### Hello World

<table>
<tr> <th>Barista</th><th>JavaScript</th><tr>
</tr>
<td>

```
serve(“Hello World!”)
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
order Main {
  hopper (pump x, long y) {
    pump shot.x = x
    long shot.y = y
  }

  item changeMaker(pump x) {
    serve shot.x
  }
}
```

</td>
<td>

```javascript
class Main {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  changeMaker() {
    return this.x
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
item returnNegativeOne(pump x) {
  ristretto pump y espresso x {
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

### While

<table>
<tr> <th>Barista</th><th>JavaScript</th><tr>
</tr>
<td>

```
item whileBreak() {
  blend (true) {
    orderUp("WHILE STATEMENT")
    tamp
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
item fibonacci(pump x) {
  brew (x <= 1) {
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
