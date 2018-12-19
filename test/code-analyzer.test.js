import assert from 'assert';
import {getSubstitutedCodeAndColoredLines,parseCode,paintRows} from '../src/js/code-analyzer';

describe('function with while', () => {
    it('without argeuments', () => {
        let withoutSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nwhile(big < 18) {\nbig = big + 10;\n}\n}'), {}, '', false);
        let withSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nwhile(big < 18) {\nbig = big + 10;\n}\n}'), {}, '', true);
        let actual = paintRows(withoutSub['substitutedJSON'],withSub['redRows'], withSub['greenRows'] , withoutSub['unpaintedRows']);
        let expected = [{line:'function biggy() {', color:'black'}, {line:'    while (17 < 18) {', color:'black'},{line:'    }', color:'black'},{line:'}', color:'black'}];
        assert.deepEqual(actual,expected);
    });
});
describe('function without if condition', () => {
    it('with argeuments', () => {
        let withoutSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(x){\nlet big = x + 2;\nreturn big;\n}'), {}, '', false);
        let withSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(x){\nlet big = x + 2;\nreturn big;\n}'), {}, '2', true);
        let actual = paintRows(withoutSub['substitutedJSON'],withSub['redRows'], withSub['greenRows'] , withoutSub['unpaintedRows']);
        let expected = [{line:'function biggy(x) {', color:'black'}, {line:'    return x + 2;', color:'black'}, {line:'}', color:'black'}];
        assert.deepEqual(actual,expected);});
    it('without argeuments', () => {
        let withoutSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nreturn big;\n}'), {}, '', false);
        let withSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nreturn big;\n}'), {}, '', true);
        let actual = paintRows(withoutSub['substitutedJSON'],withSub['redRows'], withSub['greenRows'] , withoutSub['unpaintedRows']);
        let expected = [{line:'function biggy() {', color:'black'}, {line:'    return 17;', color:'black'}, {line:'}', color:'black'}];
        assert.deepEqual(actual,expected);});
    it('without argeuments with assianment', () => {
        let withoutSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nreturn big;\n}'), {}, '', false);
        let withSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nbig = 2;\nreturn big;\n}'), {}, '', true);
        let actual = paintRows(withoutSub['substitutedJSON'],withSub['redRows'], withSub['greenRows'] , withoutSub['unpaintedRows']);
        let expected = [{line:'function biggy() {', color:'black'}, {line:'    return 17;', color:'black'}, {line:'}', color:'black'}];
        assert.deepEqual(actual,expected);});
});

describe('function with if condition without args', () => {
    it('without argeuments', () => {
        let withoutSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nif(big < 15){\nreturn big;\n}else{\nreturn 15;\n}\n}'), {}, '', false);
        let withSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nif(big < 15){\nreturn big;\n}else{\nreturn 15;\n}\n}'), {}, '', true);
        let actual = paintRows(withoutSub['substitutedJSON'],withSub['redRows'], withSub['greenRows'] , withoutSub['unpaintedRows']);
        let expected = [{line:'function biggy() {', color:'black'}, {line:'    if (17 < 15) {', color:'red'}, {line:'        return 17;', color:'black'}, {line:'    } else {', color:'green'}, {line:'        return 15;', color:'black'}, {line:'    }', color:'black'}, {line:'}', color:'black'}];
        assert.deepEqual(actual,expected);});
    it('without argeuments binary op inside if', () => {
        let withoutSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nif(big < (15 - 2)*5){\nreturn big;\n}else{\nreturn 15;\n}\n}'), {}, '', false);
        let withSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nif(big < (15 - 2)*5){\nreturn big;\n}else{\nreturn 15;\n}\n}'), {}, '', true);
        let actual = paintRows(withoutSub['substitutedJSON'],withSub['redRows'], withSub['greenRows'] , withoutSub['unpaintedRows']);
        let expected = [{line:'function biggy() {', color:'black'}, {line:'    if (17 < 65) {', color:'green'}, {line:'        return 17;', color:'black'}, {line:'    } else {', color:'red'}, {line:'        return 15;', color:'black'}, {line:'    }', color:'black'}, {line:'}', color:'black'}];
        assert.deepEqual(actual,expected);});
    it('without argeuments if litral', () => {
        let withoutSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nif(true){\nreturn big;\n}else{\nreturn 15;\n}\n}'), {}, '', false);
        let withSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(){\nlet big = 17;\nif(true){\nreturn big;\n}else{\nreturn 15;\n}\n}'), {}, '', true);
        let actual = paintRows(withoutSub['substitutedJSON'],withSub['redRows'], withSub['greenRows'] , withoutSub['unpaintedRows']);
        let expected = [{line:'function biggy() {', color:'black'}, {line:'    if (true) {', color:'green'}, {line:'        return 17;', color:'black'}, {line:'    } else {', color:'red'}, {line:'        return 15;', color:'black'}, {line:'    }', color:'black'}, {line:'}', color:'black'}];
        assert.deepEqual(actual,expected);});
});

describe('function with if condition and basic args', () => {
    it('with int argeuments', () => {
        let withoutSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(small){\nlet big = 17;\nlet a = small;\nif(a < big){\nreturn 2;\n}else{\nreturn 1;\n}\n}'), {}, '', false);
        let withSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(small){\nlet big = 17;\nlet a = small;\nif(a < big){\nreturn 2;\n}else{\nreturn 1;\n}\n}'), {}, '4', true);
        let actual = paintRows(withoutSub['substitutedJSON'],withSub['redRows'], withSub['greenRows'] , withoutSub['unpaintedRows']);
        let expected = [{line:'function biggy(small) {', color:'black'}, {line:'    if (small < 17) {', color:'green'}, {line:'        return 2;', color:'black'}, {line:'    } else {', color:'red'}, {line:'        return 1;', color:'black'}, {line:'    }', color:'black'}, {line:'}', color:'black'}];
        assert.deepEqual(actual,expected);});
    it('with string argeuments', () => {
        let withoutSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(small){\nlet big = "manor";\nlet a = small;\nif(small == big){\nreturn 2;\n}else{\nreturn 1;\n}\n}'), {}, '', false);
        let withSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(small){\nlet big = "manor";\nlet a = small;\nif(small == big){\nreturn 2;\n}else{\nreturn 1;\n}\n}'), {}, '"manorFromArgs"', true);
        let actual = paintRows(withoutSub['substitutedJSON'],withSub['redRows'], withSub['greenRows'] , withoutSub['unpaintedRows']);
        let expected = [{line:'function biggy(small) {', color:'black'}, {line:'    if (small == \'manor\') {', color:'red'}, {line:'        return 2;', color:'black'}, {line:'    } else {', color:'green'}, {line:'        return 1;', color:'black'}, {line:'    }', color:'black'}, {line:'}', color:'black'}];
        assert.deepEqual(actual,expected);});
    it('with arr argeuments', () => {
        let withoutSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(small){\nsmall[0] = 5;\nlet a = 5;\nif(small[0] == a){\nreturn 2;\n}else{\nreturn 1;\n}\n}'), {}, '', false);
        let withSub = getSubstitutedCodeAndColoredLines(parseCode('function biggy(small){\nsmall[0] = 5;\nlet a = 5;\nif(small[0] == a){\nreturn 2;\n}else{\nreturn 1;\n}\n}'), {}, '[1]', true);
        let actual = paintRows(withoutSub['substitutedJSON'],withSub['redRows'], withSub['greenRows'] , withoutSub['unpaintedRows']);
        let expected = [{line:'function biggy(small) {', color:'black'},{line:'    small[0] = 5;', color:'black'}, {line:'    if (small[0] == 5) {', color:'green'}, {line:'        return 2;', color:'black'}, {line:'    } else {', color:'red'}, {line:'        return 1;', color:'black'}, {line:'    }', color:'black'}, {line:'}', color:'black'}];
        assert.deepEqual(actual,expected);});
});