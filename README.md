
# Cycle

A simple programming/scripting language build with javascript


## Run Locally

Clone the project

```bash
  git clone https://github.com/YigitGunduc/cycle.git
```

Go to the project directory

```bash
  cd cycle
```

Run your script

```bash
  node src/index.js filename.cyc
```
or

```bash
./cycle filename.cyc
```

## Usage/Examples

```javascript
a <- 1 to 10 : p(a) // for loops

p(a) // printing a variable

a = 123 // assingment 

a == 123 ? a = 3 : p(a) // if statments

p(a) // printing a variable
```

### assingment
```javascript
<variable> <=> <digit>

//example
a = 123
```

### printing
```javascript
<p(> <variable> <)>

//example
p(a)
```

### If statments
```javascript
<varibale> <==> <digit> <?> <true case> <:> <false case>

// example
a == 123 ? a = 3 : p(a) 
```

### for loops
```javascript
<varibale> < <- > <digit> <to> <digit> <:> <do every iteration>

// example
a <- 1 to 10 : p(a) 
```
## Roadmap

- Support for variable to varibale comparasion

- Support more keywords

- Fix end of file error


## Contributing
Any contributions you make are greatly appreciated.

## License

[MIT](https://choosealicense.com/licenses/mit/)

