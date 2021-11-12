digitRegex = /^[0-9]+/
letterRegex = /^[A-Za-z]+/

// base state
let state = {
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
  constructor() {
    super();
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
        result: res
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

    return {
      ...tempState,
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
const variableParser = new StringParser('a', type='var');
const printParser = new StringParser('p(', type='keywork');
const rp =  new StringParser(')', type='rigth paran')
const equalParser = new StringParser('=', type='equal');
const equalequalParser = new StringParser('==', type='isequal');
const procede = new StringParser(':', type='ifseperator');
const qm =  new StringParser('?', type='if')



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

const comp = new SequenceParser([
  variableParser,
  equalequalParser,
  digits,
  qm,
  declerationOrPrint,
  procede,
  declerationOrPrint
])

let s = generateState('a==123?a=3:p(a)')

console.log(comp.parse(s))


