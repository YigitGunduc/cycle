digitRegex = /^[0-9]+/
letterRegex = /^[A-Za-z]+/

// base state
state = {
  input: 'they',
  result: '',
  startsAt: 0,
  endsAt: 0,
  length: 0,
  error: null,
  isError: false
}

class StringParser {
  constructor(target) {
    this.target = target;
  }

  parse(state) {
    let { input, endsAt } = state;

    if(input.lenght === 0) {
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
        result: this.target
      };
    } else {
      return {
        ...state,
        error: 'StringParser could not match with input',
        isError: true
      };
    }
  }

  apply(state, fn) {
    let newState = this.parse(state);
    return {
      ...state,
      result: fn(newState.result)
    }
  }
}


class DigitParser{
  constructor() {}

  parse(state) {
    let { input, endsAt } = state;

    if(input.lenght === 0) {
      return {
        ...state,
        isError: true,
        error: 'DigitParser expected input but got empyt string instead'
      };
    }

    if(digitRegex.test(input.slice(endsAt))) {
      let res = input.slice(endsAt).match(digitRegex)[0]
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
        error: 'DigitParser could not match any input',
        isError: true
      };
    }
  }

  apply(state, fn) {
    let newState = this.parse(state);
    return {
      ...state,
      result: fn(newState.result)
    }
  }
}

class LetterParser {
  constructor() {}

  parse(state) {
    let { input, endsAt } = state;

    if(input.lenght === 0) {
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

  apply(state, fn) {
    let newState = this.parse(state);
    return {
      ...state,
      result: fn(newState.result)
    }
  }
}

class AnyParser {
  constructor(parsers) {
    this.parsers = parsers;
  }

  parse(state) {

    let tempState = state; 
    for (let i = 0; i < this.parsers.length; i++) {
      tempState = this.parsers[i].parse(tempState);

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
}

class ManyParser {
  constructor(parser) {
    this.parser = parser;
  }

  parse(state) {
    let results = [];
    let tempState = state;

    while(!(tempState.endsAt === tempState.input.length)) {

      tempState = this.parser.parse(tempState);
      results.push(tempState.result);

    }

    return {
      ...tempState,
      result: results,
      error: null,
      isError: false
    };
  }
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


// TODO: fix random error that is occurin because of the i + 1 number of iteration
const many = (state, parser) => {
  let results = [];
  let tempState = state;


  let flag = true;

  while(flag) {


    tempState = parser.parse(tempState);
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

// TODO: implement the many1 parser
// TODO: implement the sequece parser class
