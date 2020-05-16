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
  hasUnaryOp,
  isOp,
  isCommaSymbol,
  hasDotLookAhead,
  hasStartBracketAhead,
  hasIdentifierKey,
  isMethod,
  convertOpToCommand,
  convertUnaryOpToCommand,
  isIntergerConstant,
  isStringConstant,
  isKeywordConstant,
  isDot,
  convertedKindToSegment,
} from "./utils";
import { SymbolKind, Type, Name, SymbolTable } from "../SymbolTable";
import { VMWriter, Segment, Command, OS_MATH, OS_MEMORY } from "../VMWriter";

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
  let kind: SymbolKind;
  let type: Type;
  let name: Name;
  addCompileXMLList("classVarDec", "open");

  // kind
  kind = getTokenValue() as SymbolKind; // static | field
  addCompileXMLList(getTokenKey()); // static | field
  advance();

  // type
  type = getTokenValue();
  addCompileXMLList(getTokenKey());
  advance();

  // name
  name = getTokenValue();
  addCompileXMLList(getTokenKey());
  advance();

  // define varDec
  SymbolTable.define(name, type, kind);

  while (true) {
    if (isSemicolonSymbol()) {
      addCompileXMLList(getTokenKey()); // ;
      break;
    }

    // comma
    addCompileXMLList(getTokenKey()); // ,
    advance();

    // add name
    name = getTokenValue();
    addCompileXMLList(getTokenKey());

    if (name === ";" || name === ",") throw new Error(`invalid name ${name}`);

    // define varDec additional
    SymbolTable.define(name, type, kind);
    advance();
  }
  addCompileXMLList("classVarDec", "close");
};

// varDec
export const compileVarDec = () => {
  let type: Type;
  let name: Name;
  addCompileXMLList("varDec", "open");

  // keyword
  addCompileXMLList(getTokenKey()); // var
  advance();

  // type
  type = getTokenValue();
  addCompileXMLList(getTokenKey()); // type
  advance();

  while (!isSemicolonSymbol()) {
    // , 区切りはSymbolTableに不要なので、XMLにだけ追加
    if (isCommaSymbol()) {
      addCompileXMLList(getTokenKey()); // ,
      advance();
      continue;
    }

    // identifier
    name = getTokenValue();
    SymbolTable.define(name, type, SymbolKind.Var);
    addCompileXMLList(getTokenKey()); // identifier
    advance();
  }

  addCompileXMLList(getTokenKey()); // ;
  addCompileXMLList("varDec", "close");
};

// subroutineBody
export const compileSubroutineBody = (kind: string, name: Name) => {
  addCompileXMLList("subroutineBody", "open");
  addCompileXMLList(getTokenKey()); // {
  let functionName: string;

  advance();

  while (isVarDec()) {
    compileVarDec();
    advance();
    continue;
  }

  functionName = `${TokenManager.getClassName()}.${name}`;
  VMWriter.writeFunction(functionName, SymbolTable.varCount(SymbolKind.Var));

  if (kind === "constructor") {
    VMWriter.writePush(Segment.Const, SymbolTable.varCount(SymbolKind.Field));
    VMWriter.writeCall(OS_MEMORY.ALLOC, 1);
    VMWriter.writePop(Segment.Pointer, 0);
  }
  if (kind === "method") {
    VMWriter.writePush(Segment.Arg, 0);
    VMWriter.writePop(Segment.Pointer, 0);
  }

  compileStatements(); // let

  addCompileXMLList(getTokenKey()); // }
  addCompileXMLList("subroutineBody", "close");
};

// parameterList
export const compileParameterList = () => {
  let type: Type;
  let name: Name;

  // compileParameterList の終端記号はタグの外に置く
  addCompileXMLList(getTokenKey()); // (
  addCompileXMLList("parameterList", "open");
  advance();

  while (true) {
    if (isEndParenthesis()) {
      break;
    }
    if (isCommaSymbol()) {
      addCompileXMLList(getTokenKey()); // ,
      advance();
      continue;
    }

    // type
    type = getTokenValue();
    addCompileXMLList(getTokenKey()); // type
    advance();

    // name
    name = getTokenValue();
    if (name === "," || name === ")") {
      throw new Error(`invalid name: ${name}`);
    }
    SymbolTable.define(name, type, SymbolKind.Argument);
    addCompileXMLList(getTokenKey()); // name
    advance();
  }
  addCompileXMLList("parameterList", "close");
  addCompileXMLList(getTokenKey()); // )
};

// subRoutine
export const compileSubroutine = () => {
  addCompileXMLList("subroutineDec", "open");
  addCompileXMLList("keyword");
  let kind: string;
  let name: Name;
  SymbolTable.startSubroutine();

  // define Method
  if (isMethod()) {
    SymbolTable.define(
      "self",
      TokenManager.getClassName(),
      SymbolKind.Argument
    );
  }

  // set Kind
  kind = getTokenValue();
  if (kind !== "constructor" && kind !== "function" && kind !== "method") {
    throw new Error(`invalid subroutine kind: ${kind}`);
  }

  // set type
  advance();
  addCompileXMLList(getTokenKey()); // void | type

  // set Name
  advance();
  name = getTokenValue();
  addCompileXMLList(getTokenKey()); // subroutineName

  while (true) {
    advance();
    // parameterList
    if (isStartParenthesis()) {
      compileParameterList();
      continue;
    }
    // subroutineBody
    if (isStartBrace()) {
      compileSubroutineBody(kind, name);
      break;
    }
    addCompileXMLList(getTokenKey());
  }
  addCompileXMLList("subroutineDec", "close");
};

export const compileSubroutineCall = () => {
  let functionName = "";
  let args = 0;
  let subroutineName: string;

  // identifier
  addCompileXMLList(getTokenKey()); // subroutine, var, class
  let identifier = getTokenValue();
  advance();

  console.log(`indetieifer:${identifier}`);

  // .subroutine
  if (isDot()) {
    // dot
    addCompileXMLList(getTokenKey()); // .
    advance();

    // subroutineName
    addCompileXMLList(getTokenKey());
    subroutineName = getTokenValue();
    const type = SymbolTable.kindOf(getTokenKey());

    // instance
    if (type != null) {
      const kind = SymbolTable.kindOf(identifier);
      const index = SymbolTable.indexOf(identifier);

      if (kind == null) throw new Error(`kind is not found`);
      if (index == null) throw new Error(`index is not found`);

      const segment = convertedKindToSegment(kind);

      VMWriter.writePush(segment, index);
      functionName = `${type}.${subroutineName}`;
      args++;
    }
    // class
    else {
      functionName = `${identifier}.${subroutineName}`;
    }
    advance();
  }
  // (
  else if (isStartParenthesis()) {
    subroutineName = identifier;
    functionName = `${TokenManager.getClassName()}.${subroutineName}`;
    args++;
    VMWriter.writePush(Segment.Pointer, 0);
  }

  // expression
  addCompileXMLList(getTokenKey()); // (
  compileExpressionList();
  addCompileXMLList(getTokenKey()); // )

  if (!functionName) throw new Error(`function name is invalid`);

  VMWriter.writeCall(functionName, args);
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
  let kind: SymbolKind | null;
  let name: Name;
  let index: number | null;
  addCompileXMLList("letStatement", "open");
  addCompileXMLList(getTokenKey()); // let

  // name, kind, inedx
  advance();
  name = getTokenValue();
  kind = SymbolTable.kindOf(name);
  index = SymbolTable.indexOf(name);
  addCompileXMLList(getTokenKey());

  while (!isSemicolonSymbol()) {
    advance();
    if (isStartBracket()) {
      addCompileXMLList(getTokenKey()); // [
      advance();
      compileExpression(isEndBracket);
      addCompileXMLList(getTokenKey()); // ]

      // vm
      if (kind == null) throw new Error(`kind is not found`);
      if (index == null) throw new Error(`index is not found`);
      VMWriter.writePush((kind as unknown) as Segment, index);
      VMWriter.writeArithmetic(Command.Add);
      VMWriter.writePop(Segment.Temp, 0);

      advance();
      addCompileXMLList(getTokenKey()); // =
      advance();
      compileExpression(isSemicolonSymbol);
      addCompileXMLList(getTokenKey()); // ;

      VMWriter.writePush(Segment.Temp, 0);
      VMWriter.writePop(Segment.Pointer, 1);
      VMWriter.writePop(Segment.That, 0);
      continue;
    } else {
      addCompileXMLList(getTokenKey()); // =
      advance();
      compileExpression(isSemicolonSymbol);
      addCompileXMLList(getTokenKey()); // ;

      // vm
      if (kind == null) throw new Error(`kind is not found`);
      if (index == null) throw new Error(`index is not found`);
      VMWriter.writePop((kind as unknown) as Segment, index);

      continue;
    }
  }
  addCompileXMLList("letStatement", "close");
};

// if
export const compileIf = () => {
  const ifIndex = VMWriter.getIfIndex();
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
  VMWriter.writeIf(`IF_TRUE${ifIndex}`);
  VMWriter.writeGoto(`IF_FALSE${ifIndex}`);
  VMWriter.writeLabel(`IF_TRUE${ifIndex}`);
  compileStatements();
  VMWriter.writeGoto(`IF_END${ifIndex}`);
  addCompileXMLList(getTokenKey()); // }
  VMWriter.writeLabel(`IF_FALSE${ifIndex}`);
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
  VMWriter.writeLabel(`IF_END${ifIndex}`);
  VMWriter.addIfIndex();
  addCompileXMLList("ifStatement", "close");
};

// do
export const compileDo = () => {
  addCompileXMLList("doStatement", "open");
  addCompileXMLList(getTokenKey()); // do

  // subroutineCall
  advance();
  compileSubroutineCall();
  advance();

  addCompileXMLList(getTokenKey()); // ;
  addCompileXMLList("doStatement", "close");
  VMWriter.writePop(Segment.Temp, 0);
  advance();
};

// while
export const compileWhile = () => {
  addCompileXMLList("whileStatement", "open");
  const whileIndex = VMWriter.getWhileIndex();
  addCompileXMLList(getTokenKey()); // while
  advance();

  //vm
  VMWriter.writeLabel(`WHILE${whileIndex}`);

  // conition
  addCompileXMLList(getTokenKey()); // (
  advance();
  compileExpression(isEndParenthesis);
  VMWriter.writeArithmetic(Command.Not);
  addCompileXMLList(getTokenKey()); // )
  advance();

  // statements
  addCompileXMLList(getTokenKey()); // {
  VMWriter.writeIf(`WHILE_END${whileIndex}`);
  advance();
  compileStatements();
  VMWriter.writeGoto(`WHILE${whileIndex}`);
  VMWriter.writeLabel(`WHILE_END${whileIndex}`);
  addCompileXMLList(getTokenKey()); // }
  advance();

  VMWriter.addWhileIndex();
  addCompileXMLList("whileStatement", "close");
};

// return
export const compileReturn = () => {
  addCompileXMLList("returnStatement", "open");
  addCompileXMLList(getTokenKey()); // return
  advance();
  if (isSemicolonSymbol()) {
    addCompileXMLList(getTokenKey()); // ;
    VMWriter.writePush(Segment.Const, 0);
  } else {
    compileExpression(isSemicolonSymbol);
    addCompileXMLList(getTokenKey()); // ;
  }
  VMWriter.writeReturn();
  addCompileXMLList("returnStatement", "close");
  advance();
};

// expression
export const compileExpression = (endCondition: () => boolean) => {
  addCompileXMLList("expression", "open");
  if (hasUnaryOp()) {
    addCompileXMLList("term", "open");
    addCompileXMLList(getTokenKey()); // unaryOp
    VMWriter.writeArithmetic(convertUnaryOpToCommand());
    advance();
    compileTerm();
    addCompileXMLList("term", "close");
    advance();
  }
  while (!endCondition()) {
    if (isOp()) {
      addCompileXMLList(getTokenKey()); // op
      if (getTokenValue() === "*") {
        VMWriter.writeCall(OS_MATH.MULTIPLY, 2);
      } else if (getTokenValue() === "/") {
        VMWriter.writeCall(OS_MATH.DIVIDE, 2);
      } else {
        VMWriter.writeArithmetic(convertOpToCommand());
      }
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
  // Var Name
  if (hasDotLookAhead()) {
    compileSubroutineCall();
  } else if (hasStartBracketAhead()) {
    addCompileXMLList(getTokenKey());
    advance();
    addCompileXMLList(getTokenKey()); // [
    advance();
    compileExpression(isEndBracket);
    addCompileXMLList(getTokenKey()); // ]
  } else {
    addCompileXMLList(getTokenKey());
  }
};

// term
export const compileTerm = () => {
  addCompileXMLList("term", "open");
  if (hasIdentifierKey()) {
    compileIdentifierOnTerm();
  } else {
    addCompileXMLList(getTokenKey());
  }
  if (isStartParenthesis()) {
    // (
    advance();
    compileExpression(isEndParenthesis);
    addCompileXMLList(getTokenKey()); // )
  }
  if (isIntergerConstant())
    VMWriter.writePush(Segment.Const, parseInt(getTokenValue(), 10));
  if (isStringConstant()) {
    const str = getTokenValue() as string;
    VMWriter.writePush(Segment.Const, str.length);
    VMWriter.writeCall("String.new", 1);
    [...str].forEach((char) => {
      const charPoint = char.codePointAt(0);
      if (!charPoint)
        throw new Error(`failed to converting charPoint: ${char}`);
      VMWriter.writePush(Segment.Const, charPoint);
      VMWriter.writeCall("String.appendChar", 2);
    });
  }
  if (isKeywordConstant()) {
    const str = getTokenValue() as string;
    if (str === "this") {
      VMWriter.writePush(Segment.Pointer, 0);
    } else {
      VMWriter.writePush(Segment.Const, 0);
      if (str === "true") {
        VMWriter.writeArithmetic(Command.Not);
      }
    }
  }
  addCompileXMLList("term", "close");
};

export const iterateComplation = () => {
  if (getTokenKey() === "keyword" && getTokenValue() === "class") {
    compileClass();
  }
  advance();
};

export const Compilation = (className: string) => {
  TokenManager.setClassName(className);
  TokenManager.createTokenMapIterator();
  while (!TokenManager.getIsNextTokenMapDone()) {
    iterateComplation();
  }
  console.log(CompileManager.getCompileList());
  console.log(VMWriter.getList());
  return CompileManager.getCompileXMLList().join("\n");
};
