digitRegex = /^[0-9]+/
letterRegex = /^[A-Za-z]+/

// base state
const state = {
  input: 'they',
  result: '',
  startsAt: 0,
  endsAt: 0,
  length: 0,
  error: null,
  isError: false
}

const generateState = _input => {
  return { 
  input: _input,
  result: '',
  startsAt: 0,
  endsAt: 0,
  length: 0,
  error: null,
  isError: false 
  }
}

class Parser {
  constructor() {}

  parse(){}

  apply(state, fn) {
    let newState = this.parse(state);
    return {
      ...state,
      result: fn(newState.result)
    }
  }
}

class StringParser extends Parser{
  constructor(target, type) {
    super();
    this.type = type;
    this.target = target;
  }

  parse(state) {
    let { input, endsAt } = state;

    if(input.length === 0) {
      return {
        ...state,
        isError: true,
        error: 'StringParser expected input but got empyt string instead'
      };
    }

    if(input.slice(endsAt).startsWith(this.target)) {
      return {
        ...state,
        startsAt: endsAt,
        endsAt: endsAt + this.target.length,
        length: this.target.length,
        result: {
          res: this.target,
          type: this.type
        }
      }
    } else {
      return {
        ...state,
        error: 'StringParser could not match with input',
        isError: true
      };
    }
  }
}

class DigitParser extends Parser{
  constructor() {
    super();
  }

  parse(state) {
    let { input, endsAt } = state;

    if(digitRegex.test(input.slice(endsAt))) {
      let res = input.slice(endsAt).match(digitRegex)[0]
      return {
        ...state,
        startsAt: endsAt,
        endsAt: endsAt + res.length,
        length: res.length,
        result: {
          res: res,
          type: 'digit',
          value: Number(res)
        }
      };
    } else {
      return {
        ...state,
        error: 'DigitParser could not match any input',
        isError: true
      };
    }
  }
}

class LetterParser extends Parser{
  constructor(type) {
    super();
    this.type = type;
  }

  parse(state) {
    let { input, endsAt } = state;

    if(input.length === 0) {
      return {
        ...state,
        isError: true,
        error: 'LetterParser expected input but got empyt string instead'
      };
    }

    if(letterRegex.test(input.slice(endsAt))) {
      let res = input.slice(endsAt).match(letterRegex)[0]
      return {
        ...state,
        startsAt: endsAt,
        endsAt: endsAt + res.length,
        length: res.length,
        result: {
          res: res,
          type: this.type
        }
      };
    } else {
      return {
        ...state,
        error: 'LetterParser could not match any input', isError: true };
    }
  }
}


class AnyParser extends Parser{
  constructor(parsers) {
    super();
    this.parsers = parsers;
  }

  parse(state) {

    for (let p of this.parsers) {
      const nextState = p.parse(state);
      if (!nextState.isError) {
        return nextState;
      }
    }

    return {
      ...state,
      isError: true,
      error: 'any did not matched with any parsers'
    };
  }
}


class ManyParser extends Parser{
  constructor(parser) {
    super();
    this.parser = parser;
  }

  parse(state) {
    let results = [];
    let tempState = state;


    let flag = true;

    while(flag) {

      tempState = this.parser.parse(tempState);
      results.push(tempState.result);

      if (tempState.endsAt === tempState.input.length) {
        flag = false;
      }
    }

    return {
      ...tempState,
      result: results
    };
  }
}


class SepBy extends Parser{
  constructor(seperatorParser) {
    super();
    this.seperatorParser = seperatorParser;
  }

  parse(state, targetParser) {
    let newState;
    let results = [];
    let tempState = state;

    while(true) {

      tempState = targetParser.parse(tempState);
      results.push(tempState.result);

      newState = this.seperatorParser.parse(tempState)
      if (newState.isError) {
        break
      }
      tempState = newState;
    }

    return { ...tempState,
      result: results,
      error: null,
      isError: false
    };
  }
}

class SequenceParser extends Parser {
  constructor(parsers) {
    super();
    this.parsers = parsers
  }

  parse(state) {
    let results = [];
    let tempState = state;

    for (let i = 0; i < this.parsers.length; i++) {
      tempState = this.parsers[i].parse(tempState);
      results.push(tempState['result'])
    }

    return {
      ...tempState,
      result: results
    };
  }
}

const any = (state, parsers) => {

  let tempState = state;

  for (let i = 0; i < parsers.length; i++) {
    tempState = parsers[i].parse(tempState);
    if (!tempState.isError) {
      return tempState;
    }
  }

  return {
    ...tempState,
    isError: true,
    error: 'any did not matched with any parsers'
  };
}

const sequence = (state, parsers) => {

  let results = [];
  let tempState = state;

  for (let i = 0; i < parsers.length; i++) {
    tempState = parsers[i].parse(tempState);
    results.push(tempState['result'])
  }

  return {
    ...tempState,
    result: results
  };
}

// TODO: fix manyparser generally it dones not work(infinite loop)
// TODO: fix random error that is occurin because of the i + 1 number of iteration
// TODO: make all parsers extend the base class
// TODO: fix any parser


//
// variable = <letter> | <variable><letter>
// variable decleration  <variable><=><digit>
// print statement <p(><variable><)>
//

const digits = new DigitParser();
// const variableParser = new StringParser('a', type='var');
const variableParser = new LetterParser(type='var')
const printParser = new StringParser('p(', type='print');
const rp =  new StringParser(')', type='rigth paran')
const equalParser = new StringParser('=', type='equal');
const equalequalParser = new StringParser('==', type='isequal');
const procede = new StringParser(':', type='ifseperator');
const qm =  new StringParser('?', type='if')
const arrowparser = new StringParser('<-', type='for')
const toparser = new StringParser('to', type='to')



const varOrPrint = new AnyParser([printParser, variableParser]);
const varOrEqual = new AnyParser([variableParser, equalParser]);
const RpOrDigit = new AnyParser([rp, digits]);



// var -> = -> digit
// var -> == / >= / <= -> digit / ? / x1 : x2


const declerationOrPrint = new SequenceParser([
  varOrPrint,
  varOrEqual,
  RpOrDigit,
]);


const a = new ManyParser(declerationOrPrint)

const comp = new SequenceParser([
  variableParser,
  equalequalParser,
  digits,
  qm,
  declerationOrPrint,
  procede,
  declerationOrPrint
])


const full = new SequenceParser([
  declerationOrPrint,
  comp,
  declerationOrPrint
])

const loop = new SequenceParser([
  variableParser,
  arrowparser,
  digits,
  toparser,
  digits,
  procede,
  declerationOrPrint
])


const an = new AnyParser([
  declerationOrPrint,
  comp,
  loop
])
const p = new ManyParser(an)

let sa = '  a <- 1 to10:p(a)p(a)a=123a==123?a=3:p(a)p(a)'
sa = sa.replace(/\s/g, "");
let teststate = generateState(sa);


let ifstate = generateState('a==123?a=3:p(a)')
let printState = generateState('p(a)')
let vardecleration = generateState('a=4')
let combine = generateState('b=5a=4b==5?b=3:p(a)p(a)')
let assingprint = generateState('a=4p(a)b=5p(b)')

// a = 4 
// a == 5 ? a = 3 : p(a)
// i <- 1 to 10 : p(a)
// p(a)

let val = p.parse(teststate).result

const evalr = (v) => {


  let arr = v.reduce((acc, curVal) => {
    return acc.concat(curVal)
  }, []);

  if (arr[0].type == 'var' &  arr[1].type == 'equal' & arr[2].type == 'digit') {
    vars[arr[0].res] = arr[2].value;
    if (arr.slice(3).length >= 3) {
      evalr(arr.slice(3))
    }
    return;
  }

  if (arr[0].type == 'print' &  arr[1].type == 'var' & arr[2].type == 'rigth paran') {

    console.log(vars[arr[1].res]);

    if (arr.slice(3).length >= 3) {
      evalr(arr.slice(3))
    }
    return;
  }

  if (arr[0].type == 'var' & arr[1].type == 'for' & arr[2].type == 'digit' & arr[3].type == 'to') {

    for (let i = arr[2].value; i < arr[4].value; i++) {
      vars[arr[0].res] = i;
      forarr = arr.slice(6, 9);
      evalr(forarr);
    }

    if (arr.length >= 3) {
      evalr(arr.slice(7));
    }
  }

  if (arr[0].type == 'var' &  arr[1].type == 'isequal' & arr[2].type == 'digit' & arr[3].type == 'if') {
    let sepAt;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].type === 'ifseperator') {
        sepAt = i;
      }
    }

    if (vars[arr[0].res] == arr[2].value) {
      evalr(arr.slice(4, sepAt).concat(arr.slice(11, )));
    } else {
      evalr(arr.slice(setAt + 1));
    }
  }
}

let vars = {};



const fs = require("fs");
// read the file
let  content = fs.readFileSync("demo.cyc");
// print it
content = content.toString();


content = content.replace(/\s/g, "");
let demostate = generateState(content);

// a = 4 
// a == 5 ? a = 3 : p(a)
// i <- 1 to 10 : p(a)
// p(a)

let val1 = p.parse(demostate).result

evalr(val1)

// TODO: exit evalr function all the input is evaluated
// TODO: endif expressin
// TODO: recurcive parsers
