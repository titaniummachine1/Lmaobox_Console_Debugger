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
            vscode.ViewColumn.One,
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

async function handleWebviewMessages(panel, outputChannel) {
    panel.webview.onDidReceiveMessage(async (message) => {
        try {
            if (message.command === 'sendCommand') {
                const { text } = message;
                outputChannel.appendLine(`Received command from webview: ${text}`);
                
                // Send command to RCON and handle response
                await sendCommandToRcon(text, panel, outputChannel);
            }
        } catch (error) {
            outputChannel.appendLine(`Error processing webview message: ${error.message}`);
        }
    });
}

module.exports = {
    createConsolePanel
};
