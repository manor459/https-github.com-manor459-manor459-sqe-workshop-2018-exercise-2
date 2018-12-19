import $ from 'jquery';
import {getSubstitutedCodeAndColoredLines,parseCode,paintRows} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val().replace(/[\r\n]+/g,'\n').replace(/[\r\n]+/g, '\r\n').replace('\r\n{','{').replace('}\r\n','}');
        let args = $('#argsTextBox').val();
        $('#CodeAfterSubstitute').empty();
        let SubtitutedCodeAndColoredLinesResultWithArgs = getSubstitutedCodeAndColoredLines(parseCode(codeToParse),{},args,true);
        let SubtitutedCodeAndColoredLinesResultWithoutArgs = getSubstitutedCodeAndColoredLines(parseCode(codeToParse),{},'',false);
        let parsedCode=SubtitutedCodeAndColoredLinesResultWithoutArgs['substitutedJSON'];
        let paintedRows = paintRows(parsedCode,SubtitutedCodeAndColoredLinesResultWithArgs['redRows'], SubtitutedCodeAndColoredLinesResultWithArgs['greenRows'], SubtitutedCodeAndColoredLinesResultWithArgs['unpaintedRows']);
        paintedRows.forEach(function (currentColoredRow) {
            $('#CodeAfterSubstitute').append('<span style="color:'+currentColoredRow.color+';">'+currentColoredRow.line+'</span><br>');
        });
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});
