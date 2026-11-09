const TOKEN_REGEX = /\d+(?:\.\d*)?|\.\d+|[()+\-*/%]/;
export function tokenize(input){
    const tokens = [];
    let position = 0;

    while(position < input.length){
        if (/\s/.test(input[position])) {
            position++;
            continue;
        }

        const match = input.slice(position).match(TOKEN_REGEX);
        if (!match || match.index !== 0){
            throw new Error(
                `Invalid character at position ${position} : ${input[position]}`
            );
        }

        tokens.push(match[0]);
        position += match[0].length;

        if (tokens.length > 100){
            throw new Error("Too many tokens");
        }
    }

    return tokens;
}

export class Parser {
    constructor(tokens){
        this.tokens = tokens;
        this.position = 0;
    }

    peek(){
        return this.tokens[this.position];
    }
    consume() {
    return this.tokens[this.position++];
  }

  expect(token) {
    if (this.consume() !== token) {
      throw new Error(`Expected ${token}`);
    }
  }

  parse() {
    if (this.tokens.length === 0) {
      throw new Error("No valid tokens found");
    }

    const result = this.parseExpression();

    if (this.position !== this.tokens.length) {
      throw new Error(`Unexpected token: ${this.peek()}`);
    }

    return result;
  }

  // Addition and subtraction
  parseExpression() {
    let value = this.parseTerm();

    while (this.peek() === "+" || this.peek() === "-") {
      const operator = this.consume();
      const right = this.parseTerm();

      value = operator === "+"
        ? value + right
        : value - right;
    }

    return value;
  }

  // Multiplication and division
  parseTerm() {
    let value = this.parseUnary();

    while (this.peek() === "*" || this.peek() === "/") {
      const operator = this.consume();
      const right = this.parseUnary();

      if (operator === "/") {
        if (right === 0) {
          throw new Error("Division by zero");
        }

        value /= right;
      } else {
        value *= right;
      }

      this.checkFinite(value);
    }

    return value;
  }

  // Unary plus and minus
  parseUnary() {
    if (this.peek() === "+") {
      this.consume();
      return this.parseUnary();
    }

    if (this.peek() === "-") {
      this.consume();
      return -this.parseUnary();
    }

    return this.parsePostfix();
  }

  // Percentage postfix
  parsePostfix() {
    let value = this.parsePrimary();

    while (this.peek() === "%") {
      this.consume();
      value /= 100;
    }

    return value;
  }

  // Numbers and parentheses
  parsePrimary() {
    const token = this.peek();

    if (token === "(") {
      this.consume();

      const value = this.parseExpression();

      this.expect(")");

      return value;
    }

    if (
      token === undefined ||
      !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)
    ) {
      throw new Error(`Expected a number, received: ${token ?? "end"}`);
    }

    this.consume();

    const value = Number(token);

    this.checkFinite(value);

    return value;
  }

  checkFinite(value) {
    if (!Number.isFinite(value)) {
      throw new Error("Calculation produced an invalid number");
    }
  }
}

export function parseExpression(expression) {
  const tokens = tokenize(expression);
  const parser = new Parser(tokens);

  return parser.parse();
}