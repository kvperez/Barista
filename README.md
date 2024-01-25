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
