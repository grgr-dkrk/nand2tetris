import { TokenManager } from "../Tokenizer/TokenManager";
import { CompileManager } from "./CompileManager";
import {
  addCompileXMLList,
  advance,
  isEndBrace,
  isClassVarDec,
  isVarDec,
  isSubroutine,
  getTokenKey,
  isSemicolonSymbol,
  isEndParenthesis,
  isStartParenthesis,
  isStartBrace,
  getTokenValue,
  isStartBracket,
  isEndBracket,
  isEqualSymbol,
  hasUnaryOp,
  isOp,
  isCommaSymbol,
  hasDotLookAhead,
  hasStartBracketAhead,
  hasIdentifierKey,
} from "./utils";

export const compileClass = () => {
  addCompileXMLList("class", "open");
  addCompileXMLList("keyword");
  while (true) {
    advance();
    if (isEndBrace()) {
      break;
    }
    // classVarDec
    if (isClassVarDec()) {
      compileClassVarDec();
      continue;
    }
    // classVarDec
    if (isVarDec()) {
      compileVarDec();
      continue;
    }
    // subroutineDec
    if (isSubroutine()) {
      compileSubroutine();
      continue;
    }
    addCompileXMLList(getTokenKey());
  }
  addCompileXMLList("symbol");
  addCompileXMLList("class", "close");
};

// classVarDec
export const compileClassVarDec = () => {
  addCompileXMLList("classVarDec", "open");
  addCompileXMLList(getTokenKey()); // static | field
  while (!isSemicolonSymbol()) {
    advance();
    addCompileXMLList(getTokenKey());
  }
  addCompileXMLList("classVarDec", "close");
};

// varDec
export const compileVarDec = () => {
  addCompileXMLList("varDec", "open");
  addCompileXMLList(getTokenKey()); // var
  while (!isSemicolonSymbol()) {
    advance();
    addCompileXMLList(getTokenKey());
  }
  addCompileXMLList("varDec", "close");
};

// subroutineBody
export const compileSubroutineBody = () => {
  addCompileXMLList("subroutineBody", "open");
  addCompileXMLList(getTokenKey()); // {
  while (!isEndBrace()) {
    advance();
    if (isVarDec()) {
      compileVarDec();
      continue;
    }
    compileStatements();
  }
  addCompileXMLList(getTokenKey()); // }
  addCompileXMLList("subroutineBody", "close");
};

// parameterList
export const compileParameterList = () => {
  // compileParameterList の終端記号はタグの外に置く
  addCompileXMLList(getTokenKey()); // (
  addCompileXMLList("parameterList", "open");
  advance();
  while (!isEndParenthesis()) {
    addCompileXMLList(getTokenKey());
    advance();
  }
  addCompileXMLList("parameterList", "close");
  addCompileXMLList(getTokenKey()); // )
};

// subRoutine
export const compileSubroutine = () => {
  addCompileXMLList("subroutineDec", "open");
  addCompileXMLList("keyword");
  while (true) {
    advance();
    // parameterList
    if (isStartParenthesis()) {
      compileParameterList();
      continue;
    }
    // subroutineBody
    if (isStartBrace()) {
      compileSubroutineBody();
      break;
    }
    addCompileXMLList(getTokenKey());
  }
  addCompileXMLList("subroutineDec", "close");
};

// statements
export const compileStatements = () => {
  addCompileXMLList("statements", "open");
  console.log(`token: ${getTokenValue()}`);
  while (!isEndBrace()) {
    switch (getTokenValue()) {
      case "let":
        compileLet();
        continue;
      case "if":
        compileIf();
        continue;
      case "while":
        compileWhile();
        continue;
      case "do":
        compileDo();
        continue;
      case "return":
        compileReturn();
        continue;
      default:
        console.log(`statements is break: ${getTokenValue()}`);
        break;
    }
    advance();
  }
  addCompileXMLList("statements", "close");
};

// let
export const compileLet = () => {
  addCompileXMLList("letStatement", "open");
  addCompileXMLList(getTokenKey()); // let
  while (!isSemicolonSymbol()) {
    advance();
    if (isStartBracket()) {
      addCompileXMLList(getTokenKey()); // [
      advance();
      compileExpression(isEndBracket);
      addCompileXMLList(getTokenKey()); // ]
      continue;
    }
    if (isEqualSymbol()) {
      addCompileXMLList(getTokenKey()); // =
      advance();
      compileExpression(isSemicolonSymbol);
      addCompileXMLList(getTokenKey()); // ;
      continue;
    }
    addCompileXMLList(getTokenKey());
  }
  addCompileXMLList("letStatement", "close");
};

// if
export const compileIf = () => {
  addCompileXMLList("ifStatement", "open");
  addCompileXMLList(getTokenKey()); // if
  advance();
  addCompileXMLList(getTokenKey()); // (
  advance();
  compileExpression(isEndParenthesis);
  addCompileXMLList(getTokenKey()); // )
  advance();
  addCompileXMLList(getTokenKey()); // {
  advance();
  compileStatements();
  addCompileXMLList(getTokenKey()); // }
  advance();
  if (getTokenValue() === "else") {
    addCompileXMLList(getTokenKey()); // else
    advance();
    addCompileXMLList(getTokenKey()); // {
    advance();
    compileStatements();
    addCompileXMLList(getTokenKey()); // }
    advance();
  }
  addCompileXMLList("ifStatement", "close");
};

// do
export const compileDo = () => {
  addCompileXMLList("doStatement", "open");
  addCompileXMLList(getTokenKey()); // do
  // subroutineCall
  while (!isSemicolonSymbol()) {
    advance();
    if (isStartParenthesis()) {
      addCompileXMLList(getTokenKey()); // (
      compileExpressionList();
      addCompileXMLList(getTokenKey()); // )
      continue;
    }
    addCompileXMLList(getTokenKey());
    console.log(`${getTokenKey()}:${getTokenValue()}`);
  }
  addCompileXMLList("doStatement", "close");
  advance();
};

// while
export const compileWhile = () => {
  addCompileXMLList("whileStatement", "open");
  addCompileXMLList(getTokenKey()); // while
  advance();
  addCompileXMLList(getTokenKey()); // (
  advance();
  compileExpression(isEndParenthesis);
  addCompileXMLList(getTokenKey()); // )
  advance();
  addCompileXMLList(getTokenKey()); // {
  advance();
  compileStatements();
  addCompileXMLList(getTokenKey()); // }
  advance();
  addCompileXMLList("whileStatement", "close");
};

// return
export const compileReturn = () => {
  addCompileXMLList("returnStatement", "open");
  addCompileXMLList(getTokenKey()); // return
  advance();
  if (isSemicolonSymbol()) {
    addCompileXMLList(getTokenKey()); // ;
  } else {
    compileExpression(isSemicolonSymbol);
    addCompileXMLList(getTokenKey()); // ;
  }
  addCompileXMLList("returnStatement", "close");
  advance();
};

// expression
export const compileExpression = (endCondition: () => boolean) => {
  addCompileXMLList("expression", "open");
  if (hasUnaryOp()) {
    addCompileXMLList("term", "open");
    addCompileXMLList(getTokenKey()); // unaryOp
    advance();
    compileTerm();
    addCompileXMLList("term", "close");
    advance();
  }
  while (!endCondition()) {
    if (isOp()) {
      addCompileXMLList(getTokenKey()); // op
      advance();
    }
    if (isCommaSymbol()) {
      break;
    }
    compileTerm();
    advance();
  }
  addCompileXMLList("expression", "close");
};

// expressionList
export const compileExpressionList = () => {
  addCompileXMLList("expressionList", "open");
  advance();
  while (!isEndParenthesis()) {
    if (isCommaSymbol()) {
      addCompileXMLList(getTokenKey()); //,
      advance();
    }
    compileExpression(isEndParenthesis);
  }
  addCompileXMLList("expressionList", "close");
};

export const compileIdentifierOnTerm = () => {
  if (hasDotLookAhead()) {
    advance();
    addCompileXMLList(getTokenKey()); //.
    advance();
    addCompileXMLList(getTokenKey()); // new
    advance();
    addCompileXMLList(getTokenKey()); // (
    compileExpressionList();
    addCompileXMLList(getTokenKey()); // )
  }
  if (hasStartBracketAhead()) {
    advance();
    addCompileXMLList(getTokenKey()); // [
    advance();
    compileExpression(isEndBracket);
    addCompileXMLList(getTokenKey()); // ]
  }
};

// term
export const compileTerm = () => {
  addCompileXMLList("term", "open");
  addCompileXMLList(getTokenKey());
  if (hasIdentifierKey()) compileIdentifierOnTerm();
  if (isStartParenthesis()) {
    // (
    advance();
    compileExpression(isEndParenthesis);
    addCompileXMLList(getTokenKey()); // )
  }
  addCompileXMLList("term", "close");
};

export const iterateComplation = () => {
  if (getTokenKey() === "keyword" && getTokenValue() === "class") {
    compileClass();
  }
  advance();
};

export const Compilation = () => {
  TokenManager.createTokenMapIterator();
  while (!TokenManager.getIsNextTokenMapDone()) {
    iterateComplation();
  }
  console.log(CompileManager.getCompileXMLList());
  return CompileManager.getCompileXMLList().join("\n");
};
