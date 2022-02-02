// Created by Erlang Parasu 2022.
//
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { TextDecoder, TextEncoder } from 'util';
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

        let isLinux = false;
        if (a.path.indexOf('/') >= 0) {
            isLinux = true;
        }

        let isFolder = false;
        let parsedNamespace: string | null;
        try {
            let uri = vscode.Uri.parse(a.path);
            let dataUint8Arr = await vscode.workspace.fs.readFile(uri);
            let contextContent = new TextDecoder("utf-8").decode(dataUint8Arr);
            // console.log('contextContent:', contextContent);

            parsedNamespace = parseNameSpaceFromFileContent(contextContent);
            console.log('parsedNamespace:', parsedNamespace);
        } catch (error) {
            console.log('error:', (error as object).toString());
            let strError = (error as object).toString();

            if (strError.indexOf('EntryIsADirectory') >= 0) {
                isFolder = true;

                // "app/Services/Socialite";

                let relativePath = vscode.workspace.asRelativePath(a.path);
                console.log('asRelativePath', relativePath);

                if (relativePath.length > 0) {
                    let arr = relativePath.split('');
                    arr[0] = arr[0].toUpperCase();
                    let ns = arr.join('');
                    console.log('ns', ns);

                    // "App/Services/Socialite";

                    if (isLinux) {
                        ns = ns.split('/').join('\\');
                        console.log('ns', ns);
                    } else {
                        ns = ns.split('\\').join('\\');
                        console.log('ns', ns);
                    }

                    // "App\\Services\\Socialite";

                    parsedNamespace = ns;
                }
            }
        }

        // console.log('b:', b);
        // console.log('c:', c);
        // console.log('d:', d);

        let folderPath = parseFolderFromPath(isLinux, a.path);
        console.log('folderPath:', folderPath);

        if (isFolder) {
            console.log('isFolder true:', a.path);
            if (isLinux) {
                folderPath = a.path + '/';
            }
        }

        vscode.window.showInputBox({ placeHolder: "Please enter a file name", }).then((fileName) => {
            let data = generateFileData(fileName, parsedNamespace, folderPath);
            if (null !== data) {
                if (folderPath !== null) {
                    return vscode.workspace.fs.writeFile(
                        vscode.Uri.parse(folderPath + '' + data[0] + ''),
                        new TextEncoder().encode(data[1])
                    );
                }
            }
        });

        vscode.window.showInformationMessage('Hello World from php class creator!');
    });

    context.subscriptions.push(disposable);
}

function generateFileData(fileName: string | undefined, parsedNamespace: string | null, folderPath: string | null) {
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

    parsedNamespace = (parsedNamespace ?? '').split('').filter(function (d, i, arr) {
        let alp = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ\\';
        alp = alp + alp.toLowerCase();
        return alp.split('').indexOf(d) > -1;
    }).join('');

    let raw = getClassStub();
    raw = raw.replace('{{className}}', className);

    if (parsedNamespace !== '') {
        raw = raw.replace('{{namespace}}', parsedNamespace);
    }

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

function parseNameSpaceFromFileContent(content: string) {
    // "namespace App\Http;"
    let posStart = content.indexOf('namespace ');
    if (posStart >= 0) {
        let posEnd = posStart + content.substring(posStart).indexOf(';');
        let foundStr = content.substring(posStart, posEnd);

        // "namespace App\Services\Socialite"
        let str = foundStr.replace('namespace ', '').replace(';', '');
        // "App\Services\Socialite"

        return str;
    }

    return null;
}

function parseFolderFromPath(isLinux: boolean, path: string) {
    // "/usr/local/var/www/abc/app/Services/Socialite/SocialiteServerService.php"
    if (isLinux) {
        let strFilename;
        let segments = path.split('/');
        if (segments.length > 0) {
            let lastSegment = segments[segments.length - 1];
            if (lastSegment.toLowerCase().indexOf('.php') >= 0) {
                strFilename = segments.pop();
            }
        }
        if (strFilename) {
            let resultFolderPath = path.replace(strFilename, '');
            // "/usr/local/var/www/abc/app/Services/Socialite/"
            return resultFolderPath;
        }
    }

    return null;
}
