// Created by Erlang Parasu 2022.
//
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { TextEncoder } from 'util';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "php-class-creator" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('php-class-creator.helloWorld', async (a, b) => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        console.log('path', a.path);
        console.log('_formatted', a._formatted);
        console.log('scheme', a.scheme);

        let uri = vscode.Uri.parse(a.path);
        // let c = await vscode.workspace.fs.readFile(uri);

        // console.log('b:', b);
        // console.log('c:', c);
        // console.log('d:', d);

        vscode.window.showInputBox({ placeHolder: "Please enter a file name", }).then((fileName) => {
            let data = generateFileData(fileName);
            if (null !== data) {
                return vscode.workspace.fs.writeFile(vscode.Uri.parse(a.path + '/' + data[0] + ''), new TextEncoder().encode(data[1]));
            }
        });

        vscode.window.showInformationMessage('Hello World from php class creator!');

        // vscode.workspace.fs.writeFile
    });

    context.subscriptions.push(disposable);
}

function generateFileData(fileName: string | undefined) {
    if (undefined === fileName) {
        return null;
    }

    let words = fileName.split(' ');
    let words2 = [''];
    words.forEach(function (word, indexWord) {
        let letters = word.split('');
        if (letters[0]) {
            letters[0] = letters[0].toUpperCase();
        }

        let newWord = letters.join('');
        words2.push(newWord);
    });

    let className = words2.join('');

    className = className.split('').filter(function (d, i, arr) {
        let alp = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        alp = alp + alp.toLowerCase();
        return alp.split('').indexOf(d) > -1;
    }).join('');

    let raw = getClassStub();
    raw = raw.replace('{{className}}', className);

    // TODO {{namespace}}

    let data = [];
    data[0] = className + '.php';
    data[1] = raw;

    return data;
}

function getClassStub() {
    var str = `<?php

namespace {{namespace}};

use Exception;

class {{className}}
{
    protected $property1;

    public function __construct($property1 = null)
    {
        $this->property1 = $property1;
    }

    public function getProperty1()
    {
        return $this->property1;
    }

    public function setProperty1($property1)
    {
        $this->property1 = $property1;
    }
}
`;
    return str;
}

// this method is called when your extension is deactivated
export function deactivate() { }
