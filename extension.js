const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { Rcon } = require('rcon-client');

let rconClient = null;
let connected = false;
let panel = null;
let statusBarItem;
let outputChannel;

function activate(context) {
    console.log('TF2 RCON Extension is being activated');
    outputChannel = vscode.window.createOutputChannel("TF2 RCON");
    outputChannel.show();
    outputChannel.appendLine('TF2 RCON Extension activated');

    try {
        // Create status bar item
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBarItem.command = 'extension.openTF2Console';
        context.subscriptions.push(statusBarItem);
        updateStatusBar('RCON: Initializing');

        // Register the command that opens the TF2 console
        let disposable = vscode.commands.registerCommand('extension.openTF2Console', async () => {
            outputChannel.appendLine('openTF2Console command executed');
            await createConsolePanel();
            if (panel) {
                handleWebviewMessages();
            }
        });

        context.subscriptions.push(disposable);

        // Initial connection attempt
        checkRconConnection();
    } catch (error) {
        console.error('Error activating TF2 RCON Extension:', error);
        outputChannel.appendLine(`Error activating TF2 RCON Extension: ${error.message}`);
        vscode.window.showErrorMessage('Failed to activate TF2 RCON Extension: ' + error.message);
    }
}

function loadRconPassword() {
    const configPath = path.join(vscode.workspace.rootPath || '', 'rcon-config.json');
    outputChannel.appendLine(`Attempting to load RCON config from: ${configPath}`);
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            outputChannel.appendLine('RCON config loaded successfully');
            return config.rconPassword;
        }
    } catch (error) {
        outputChannel.appendLine(`Error reading RCON config: ${error.message}`);
        vscode.window.showErrorMessage(`Error reading RCON config: ${error.message}`);
    }
    outputChannel.appendLine('RCON config not found or invalid');
    return null;
}

async function checkRconConnection() {
    outputChannel.appendLine('Attempting to connect to RCON');
    const rconPassword = loadRconPassword();
    outputChannel.appendLine(`RCON password loaded: ${rconPassword ? 'Yes' : 'No'}`);

    if (!rconPassword) {
        updateStatusBar('RCON: No Config');
        vscode.window.showErrorMessage('RCON password not found. Please create rcon-config.json.');
        return false;
    }

    try {
        updateStatusBar('RCON: Connecting...');
        rconClient = await Rcon.connect({
            host: '192.168.56.1', // Use your TF2 client's IP
            port: 27015, // This matches your TF2 client's server port
            password: rconPassword
        });
        connected = true;
        updateStatusBar('RCON: Connected');
        outputChannel.appendLine('RCON Connection Established with TF2');
        vscode.window.showInformationMessage('RCON Connection Established with TF2.');
        return true;
    } catch (error) {
        updateStatusBar('RCON: Failed');
        outputChannel.appendLine(`RCON connection failed: ${error.message}`);
        vscode.window.showErrorMessage('RCON connection failed: ' + error.message);
        connected = false;
        return false;
    }
}

async function createConsolePanel() {
    outputChannel.appendLine('Creating console panel');
    if (panel) {
        panel.reveal();
    } else {
        panel = vscode.window.createWebviewPanel(
            'tf2Console', 
            'TF2 Console', 
            vscode.ViewColumn.One, 
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();
        outputChannel.appendLine('Webview content set');

        // Ensure we are connected to RCON
        if (!connected) {
            outputChannel.appendLine('Not connected, attempting to connect');
            await checkRconConnection();
        }

        if (connected) {
            outputChannel.appendLine('Starting console refresh');
            startConsoleRefresh();
        }

        panel.onDidDispose(() => {
            outputChannel.appendLine('Console panel disposed');
            panel = null;
        });
    }
}

async function startConsoleRefresh() {
    while (connected && panel) {
        try {
            const response = await rconClient.send('status');
            panel.webview.postMessage({ type: 'response', text: response });
            outputChannel.appendLine('Sent status update to webview');
            await new Promise(resolve => setTimeout(resolve, 5000)); // Refresh every 5 seconds
        } catch (error) {
            outputChannel.appendLine(`Error in console refresh: ${error.message}`);
            panel.webview.postMessage({ type: 'error', text: 'Error: ' + error.message });
            updateStatusBar('RCON: Error');
            connected = false;
            await checkRconConnection();
        }
    }
}

function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TF2 Console</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 10px; }
            #consoleOutput { width: 100%; height: 300px; margin-bottom: 10px; }
            #commandInput { width: 80%; }
            #sendButton { width: 18%; }
        </style>
    </head>
    <body>
        <h2>TF2 Console</h2>
        <textarea id="consoleOutput" readonly></textarea><br>
        <input type="text" id="commandInput" placeholder="Enter TF2 command">
        <button id="sendButton">Send</button>

        <script>
            const vscode = acquireVsCodeApi();
            const outputArea = document.getElementById('consoleOutput');
            const commandInput = document.getElementById('commandInput');

            document.getElementById('sendButton').addEventListener('click', () => {
                vscode.postMessage({ command: 'sendCommand', text: commandInput.value });
                commandInput.value = '';
            });

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.type === 'response' || message.type === 'error') {
                    outputArea.value += message.text + '\\n';
                    outputArea.scrollTop = outputArea.scrollHeight;
                }
            });
        </script>
    </body>
    </html>
    `;
}

async function sendCommand(command) {
    outputChannel.appendLine(`Attempting to send command: ${command}`);
    if (command && rconClient && connected) {
        try {
            const response = await rconClient.send(command);
            panel.webview.postMessage({ type: 'response', text: `Command sent: ${command}` });
            panel.webview.postMessage({ type: 'response', text: response });
            outputChannel.appendLine(`Command sent successfully: ${command}`);
        } catch (error) {
            outputChannel.appendLine(`Error sending command: ${error.message}`);
            panel.webview.postMessage({ type: 'error', text: 'Error sending command: ' + error.message });
            updateStatusBar('RCON: Error');
            connected = false;
            await checkRconConnection();
        }
    } else {
        outputChannel.appendLine('Cannot send command: RCON client not connected');
        panel.webview.postMessage({ type: 'error', text: 'RCON client not connected.' });
        updateStatusBar('RCON: Disconnected');
    }
}

function handleWebviewMessages() {
    panel.webview.onDidReceiveMessage(
        async message => {
            if (message.command === 'sendCommand') {
                outputChannel.appendLine(`Received command from webview: ${message.text}`);
                await sendCommand(message.text);
            }
        },
        undefined
    );
}

function updateStatusBar(text) {
    statusBarItem.text = text;
    statusBarItem.show();
    outputChannel.appendLine(`Status bar updated: ${text}`);
}

function deactivate() {
    outputChannel.appendLine('Deactivating TF2 RCON Extension');
    if (rconClient) {
        rconClient.end();
        rconClient = null;
    }
    if (panel) {
        panel.dispose();
        panel = null;
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    outputChannel.appendLine('TF2 RCON Extension deactivated');
}

module.exports = {
    activate,
    deactivate
};