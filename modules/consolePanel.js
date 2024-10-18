const fs = require('fs');
const path = require('path');
const { sendCommandToRcon } = require('./connection');
const vscode = require('vscode'); // Add this line to import the vscode module

function createConsolePanel(context, panel, outputChannel) {
    if (panel) {
        panel.reveal();
    } else {
        panel = vscode.window.createWebviewPanel(
            'tf2Console',
            'TF2 Console',
            vscode.ViewColumn.Beside,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        const htmlPath = vscode.Uri.file(path.join(context.extensionPath, 'html', 'console.html'));
        const cssPath = vscode.Uri.file(path.join(context.extensionPath, 'css', 'console.css'));

        let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf-8');
        htmlContent = htmlContent.replace(
            '<link rel="stylesheet" type="text/css" href="vscode-resource:/css/console.css">',
            `<link rel="stylesheet" type="text/css" href="${panel.webview.asWebviewUri(cssPath)}">`
        );

        panel.webview.html = htmlContent;

        handleWebviewMessages(panel, outputChannel);
    }
}

function handleWebviewMessages(panel, outputChannel) {
    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'sendCommand') {
            outputChannel.appendLine(`Command received from webview: ${message.text}`);
            await sendCommandToRcon(message.text, panel, outputChannel);
        }
    });
}

module.exports = {
    createConsolePanel
};
