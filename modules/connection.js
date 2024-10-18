const { Rcon } = require('rcon-client');

let rconClient = null;
let connected = false;

async function connectToRcon({ password, ip, port }, outputChannel) {
    outputChannel.appendLine(`Attempting to connect to RCON at ${ip}:${port}`);

    try {
        rconClient = await Rcon.connect({ host: ip, port, password });
        connected = true;
        outputChannel.appendLine('RCON Connection Established');
        return true;
    } catch (error) {
        connected = false;
        outputChannel.appendLine(`RCON connection failed: ${error.message}`);
        return false;
    }
}

function disconnectFromRcon() {
    if (rconClient) {
        rconClient.end();
        rconClient = null;
        connected = false;
    }
}

// Send a command to the RCON server
async function sendCommandToRcon(command, panel, outputChannel) {
    if (connected && rconClient) {
        try {
            outputChannel.appendLine(`Sending command to RCON: ${command}`);
            const response = await rconClient.send(command);  // Use send instead of execute
            panel.webview.postMessage({ type: 'response', text: response });
            outputChannel.appendLine(`Received response from RCON: ${response}`);
        } catch (error) {
            outputChannel.appendLine(`Error sending command to RCON: ${error.message}`);
            panel.webview.postMessage({ type: 'error', text: 'Error: ' + error.message });
        }
    } else {
        outputChannel.appendLine('Cannot send command: Not connected to RCON');
        panel.webview.postMessage({ type: 'error', text: 'Not connected to RCON' });
    }
}

module.exports = {
    connectToRcon,
    disconnectFromRcon,
    sendCommandToRcon,
    isConnected: () => connected
};
