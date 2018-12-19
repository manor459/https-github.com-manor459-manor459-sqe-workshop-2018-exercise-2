import * as esprima from 'esprima';
import * as escodegen  from 'escodegen';

const parseCode = (codeToParse) => {
    let parsedJson = esprima.parseScript(codeToParse,{loc:true});
    return parsedJson;
};

const paintRows = (SubtitutedCodeAndColoredLinesResult,redRows, greenRows, unpaintedRows) => {
    let paintedRows = [],currentRowCounter = 0;
    try {let cleanedText = escodegen.generate(SubtitutedCodeAndColoredLinesResult).replace(/\[[\r\n]+/g,'[').replace(/,[\r\n]+/g,',').replace('\n    ];','];').replace('\n];','];');
        cleanedText.split('\n').forEach(function (row) {
            if(!unpaintedRows.includes(currentRowCounter)){
                let currentRowColor = 'black';
                if (redRows.includes(currentRowCounter)) currentRowColor = 'red';
                if (greenRows.includes(currentRowCounter)) currentRowColor = 'green';
                paintedRows.push({'line':row, 'color':currentRowColor});}
            currentRowCounter++;});} catch (e) {paintedRows = [];}
    return paintedRows;
};


let redRows = [],greenRows = [],unpaintedRows = [],Params = [],evalIfNode = false,isNodeInFunctionFleg = false;

const JsonTypeToHandlerMap={
    'ExpressionStatement':subExpressionStatement,
    'VariableDeclaration':subVariableDeclaration,
    'AssignmentExpression':subAssignmentExpression,
    'ReturnStatement':subReturnStatement,
    'IfStatement':subIfStatement,
    'WhileStatement':subWhileStatement,
    'FunctionDeclaration':subFunction,
    'Identifier':subIdentifier,
    'BinaryExpression':subBinaryExpression,
    'MemberExpression':subMemberExpression,
    'VariableDeclarator':subVariableDeclarator,
    'UpdateExpression':subUpdateExpression,
    'Program': subProgram,
    'BlockStatement':subBlockStatement,
    'Literal':subLiteral
};

const getSubstitutedCodeAndColoredLines = (unparsedJson, currentSystemEnvironment, args, evalIfNode) => {
    initMembers(evalIfNode);
    let argsFromUser =TryParseArgs(args);
    let substitutedJSON = substituteNode(unparsedJson, currentSystemEnvironment, argsFromUser);
    return {'substitutedJSON': substitutedJSON ,'redRows':redRows, 'greenRows': greenRows, 'unpaintedRows': unpaintedRows};
};

function initMembers(evalIfNodeFromUser){
    redRows = [],greenRows = [],unpaintedRows = [],Params = [];
    isNodeInFunctionFleg = false;
    evalIfNode = evalIfNodeFromUser;
}

function substituteNode(unsubstitutedStatement, currentSystemEnvironment, args) {
    try {return JsonTypeToHandlerMap[unsubstitutedStatement.type](unsubstitutedStatement, currentSystemEnvironment, args);}
    catch (e) {return unsubstitutedStatement;}
}

function TryParseArgs(args) {
    let argsListAfterParse = [];
    if(args != '') {
        try {argsListAfterParse = parseCode(args).body[0].expression;
            if(argsListAfterParse.expressions!== undefined){argsListAfterParse = argsListAfterParse.expressions;}
            else {argsListAfterParse = [argsListAfterParse];}}
        catch (e) {argsListAfterParse = [];}}
    return argsListAfterParse;
}

function subIfStatement(Statement, currentSystemEnvironment, args) {
    Statement.test = substituteNode(Statement.test, currentSystemEnvironment, args);
    if(evalIfNode){UptateColorsHelper(Statement, currentSystemEnvironment, args);}
    Statement.consequent = substituteNode(Statement.consequent, copyDictionary(currentSystemEnvironment), args);
    if(Statement.alternate != null) {
        Statement.alternate = substituteNode(Statement.alternate, copyDictionary(currentSystemEnvironment), args);
    }
    return Statement;
}
function subExpressionStatement(Statement, currentSystemEnvironment, args) {
    Statement.expression = substituteNode(Statement.expression, currentSystemEnvironment, args);
    return Statement;
}
function subVariableDeclaration(Statement, currentSystemEnvironment, args) {
    Statement.declarations.forEach(function (currDecleration) {
        if(isNodeInFunctionFleg)
        {unpaintedRows.push(currDecleration.loc.start.line - 1);}
        currDecleration = substituteNode(currDecleration, currentSystemEnvironment, args);
    });

    return Statement;
}
function subAssignmentExpression(Statement, currentSystemEnvironment, args) {
    let variableName = '';
    Statement.right = substituteNode(Statement.right, currentSystemEnvironment, args);
    if (Statement.left.type === 'MemberExpression'){variableName = Statement.left.object.name;}
    else{variableName = Statement.left.name;}
    let currentKey = createNewSystemEnvironmentKey(Statement, variableName, currentSystemEnvironment, args);
    currentSystemEnvironment[currentKey] = Statement.right;
    if (!(Params.includes(variableName))&&isNodeInFunctionFleg) {unpaintedRows.push(Statement.loc.start.line - 1);}
    return Statement;
}
function subReturnStatement(Statement, currentSystemEnvironment, args) {
    Statement.argument = substituteNode(Statement.argument, currentSystemEnvironment, args);
    return Statement;
}
function subWhileStatement(Statement, currentSystemEnvironment, args) {
    Statement.body = substituteNode(Statement.body, copyDictionary(currentSystemEnvironment), args);
    Statement.test = substituteNode(Statement.test, currentSystemEnvironment, args);
    return Statement;
}
function subFunction(Statement, currentSystemEnvironment, args) {
    Statement.params.forEach(function (currParam) {Params.push(currParam.name);});
    let functionBodyEnvironment = createFunctionLocalEnvironment(currentSystemEnvironment, args);
    isNodeInFunctionFleg = true;
    Statement.body = substituteNode(Statement.body, functionBodyEnvironment, args);
    isNodeInFunctionFleg = false;
    return Statement;
}
function subIdentifier(Statement, currentSystemEnvironment, args) {
    let ans = Statement;
    let currentVariable = tryGetVariable(Statement.name,currentSystemEnvironment,args);
    if(currentVariable !== null){ans = currentVariable;}
    return ans;
}
function subLiteral(Statement, currentSystemEnvironment, args) {
    nothing(currentSystemEnvironment,args);
    return Statement;
}
function subBinaryExpression(Statement, currentSystemEnvironment, args) {
    Statement.left = substituteNode(Statement.left, currentSystemEnvironment, args);
    Statement.right = substituteNode(Statement.right, currentSystemEnvironment, args);
    let left =Statement.left,right = Statement.right,op = Statement.operator;
    if(['+','-','*','/'].includes(op)&& (right.type === 'Literal')&&(left.type === 'Literal')) {
        let valAfterSubstitution = eval(left.raw + op + right.raw);
        return {'type':'Literal','value': valAfterSubstitution,'raw':''+valAfterSubstitution,'loc': Statement.loc};
    }
    return Statement;
}
function subMemberExpression(Statement, currentSystemEnvironment, args) {
    Statement.property = substituteNode(Statement.property, currentSystemEnvironment, args);
    let key = '',aName = Statement.object.name;
    if(Statement.property.type === 'Literal'){key = aName+'['+Statement.property.raw+']';}
    if(key in currentSystemEnvironment&&((Params.length === args.length)&&Params.includes(aName))){return currentSystemEnvironment[key];}
    return Statement;
}
function subVariableDeclarator(Statement, currentSystemEnvironment, args) {
    if(Statement.init != null){
        Statement.init = substituteNode(Statement.init, currentSystemEnvironment, args);
        if(Statement.init.type === 'ArrayExpression'){
            for(let i = 0; i < Statement.init.elements.length; i++){currentSystemEnvironment[Statement.id.name+'['+i+']'] = Statement.init.elements[i];}
        }
        else{currentSystemEnvironment[Statement.id.name] = Statement.init;}
    }
    else {currentSystemEnvironment[Statement.id.name] = Statement.init;}
    return Statement;
}
function subUpdateExpression(Statement, currentSystemEnvironment, args) {
    Statement.argument = substituteNode(Statement.argument, currentSystemEnvironment, args);
    return Statement;
}
function subProgram(Statement, currentSystemEnvironment, args) {
    Statement.body.forEach(function (currNode) {
        currNode = substituteNode(currNode, currentSystemEnvironment, args);
        currNode.length;
    });
    return Statement;
}
function subBlockStatement(Statement, currentSystemEnvironment, args) {
    let lineIndex = 0;
    Statement.body.forEach(function (currentLine) {
        Statement.body[lineIndex] = substituteNode(currentLine, currentSystemEnvironment, args);
        lineIndex++;
    });
    return Statement;
}

function createNewSystemEnvironmentKey(Statement, variableName, currentSystemEnvironment, args) {
    let currentSystemEnvironmentKey = variableName;
    if (Statement.left.type === 'MemberExpression'){
        let itemIndex = '';
        let itemIndexJsonObj = substituteNode(Statement.left.property, currentSystemEnvironment, args);
        if(itemIndexJsonObj.type === 'Literal'){
            itemIndex = itemIndexJsonObj.raw;
        }
        currentSystemEnvironmentKey = Statement.left.object.name+'['+itemIndex+']';
    }
    return currentSystemEnvironmentKey;
}
function nothing(currentSystemEnvironment,args) {
    args.length;
    currentSystemEnvironment.length;
}
function copyDictionary(oldD) {
    let newD = {};
    for(let key in oldD){
        newD[key] = oldD[key];
    }
    return newD;
}
function updateColors(subtitutedCondition, ifStatement) {
    let contidionIsTrue = subtitutedCondition.value;
    if (!contidionIsTrue) {redRows.push(ifStatement.test.loc.start.line-1);}
    else {greenRows.push(ifStatement.test.loc.start.line-1);}
    if (ifStatement.alternate != null) {//else statement
        if (!contidionIsTrue) {greenRows.push(ifStatement.alternate.loc.start.line-1);}
        else {redRows.push(ifStatement.alternate.loc.start.line-1);}
    }
}
function UptateColorsHelper(ifStatement, currentSystemEnvironment, args) {
    let subtitutedCondition = substituteNode(esprima.parseScript(escodegen.generate(ifStatement.test), {loc: true}).body[0].expression,copyDictionary(currentSystemEnvironment), args);
    if(subtitutedCondition.type === 'BinaryExpression'&&(subtitutedCondition.right.type === 'Literal'&&subtitutedCondition.left.type === 'Literal')){
        let value = eval(subtitutedCondition.left.raw + subtitutedCondition.operator + subtitutedCondition.right.raw);
        subtitutedCondition = {
            'type': 'Literal',
            'value': value,
            'raw': '' + value,
            'loc': subtitutedCondition.loc};}
    if (subtitutedCondition.type === 'Literal') {updateColors(subtitutedCondition, ifStatement);}
}
function tryGetVariable(variableName,currentSystemEnvironment,args) {
    let currentVariable = null;
    if (variableName in currentSystemEnvironment) {
        if ((Params.length === args.length&&Params.includes(variableName))||(!Params.includes(variableName)))
        { currentVariable = currentSystemEnvironment[variableName];}
    }
    return currentVariable;
}
function createFunctionLocalEnvironment(currentSystemEnvironment, args) {
    let FunctionLocalEnvironment = currentSystemEnvironment;
    if(Params.length > 0) {
        FunctionLocalEnvironment = copyDictionary(currentSystemEnvironment);
        initFuncArguments(FunctionLocalEnvironment,!args.length > 0,args);
    }
    return FunctionLocalEnvironment;
}

function initFuncArguments(Environment,isEmpry,args) {
    if(isEmpry) {
        Params.forEach(function (currPararm) {Environment[currPararm] = parseCode(currPararm).body[0].expression;});
    }
    else {
        let argIndex =0;
        args.forEach(function (currArg) {
            if (currArg.type === 'ArrayExpression') {
                for (let itemIndex = 0; itemIndex < currArg.elements.length; itemIndex++) {
                    Environment[Params[argIndex] + '[' + itemIndex + ']'] = args[argIndex].elements[itemIndex];
                }
            } else {
                Environment[Params[argIndex]] = args[argIndex];
            }
            argIndex++;
        });
    }
}

export {getSubstitutedCodeAndColoredLines,parseCode,paintRows};

