const vscode = require('vscode');
const { loadRconConfig, setRconPassword, setRconIp } = require('./modules/config');
const { connectToRcon, disconnectFromRcon, isConnected } = require('./modules/connection');
const { createStatusBar, updateStatusBar, disposeStatusBar } = require('./modules/statusBar');
const { createConsolePanel } = require('./modules/consolePanel');

let panel = null;
let outputChannel;

function activate(context) {
    console.log('TF2 RCON Extension is being activated');
    outputChannel = vscode.window.createOutputChannel("TF2 RCON");
    outputChannel.show();
    outputChannel.appendLine('TF2 RCON Extension activated');

    try {
        createStatusBar();

        // Auto-open the console on startup
        autoOpenConsole(context);

        // Register command to manually open TF2 console
        let openConsoleDisposable = vscode.commands.registerCommand('extension.openTF2Console', () => {
            outputChannel.appendLine('Open TF2 Console command executed');
            createConsolePanel(context, panel, outputChannel);
        });
        context.subscriptions.push(openConsoleDisposable);

        // Register command to set RCON password
        let setPasswordDisposable = vscode.commands.registerCommand('extension.setRconPassword', setRconPassword);
        context.subscriptions.push(setPasswordDisposable);

        // Register command to set RCON IP
        let setIpDisposable = vscode.commands.registerCommand('extension.setRconIp', setRconIp);
        context.subscriptions.push(setIpDisposable);

        // Initial connection attempt
        checkRconConnection();
    } catch (error) {
        console.error('Error activating TF2 RCON Extension:', error);
        outputChannel.appendLine(`Error activating TF2 RCON Extension: ${error.message}`);
        vscode.window.showErrorMessage('Failed to activate TF2 RCON Extension: ' + error.message);
    }
}

async function checkRconConnection() {
    const { password, ip, port } = loadRconConfig(outputChannel);
    if (password && ip && port) {
        const connected = await connectToRcon({ password, ip, port }, outputChannel);
        updateStatusBar(connected ? 'RCON: Connected' : 'RCON: Failed');
    }
}

function autoOpenConsole(context) {
    outputChannel.appendLine('Automatically opening TF2 Console on startup');
    createConsolePanel(context, panel, outputChannel);
}

function deactivate() {
    outputChannel.appendLine('Deactivating TF2 RCON Extension');
    disconnectFromRcon();
    if (panel) panel.dispose();
    disposeStatusBar();
    outputChannel.appendLine('TF2 RCON Extension deactivated');
}

module.exports = {
    activate,
    deactivate
};
