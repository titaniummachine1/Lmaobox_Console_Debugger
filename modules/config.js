const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// Loads the RCON configuration from settings or a config file
function loadRconConfig(outputChannel) {
    let config = vscode.workspace.getConfiguration('tf2rcon');
    let password = config.get('rconPassword');
    let ip = config.get('rconIp');
    let port = config.get('rconPort') || 27015; // Default port is 27015

    if (password && ip) {
        outputChannel.appendLine('RCON config loaded from settings');
        return { password, ip, port };
    }

    // If not found in settings, load from a config file
    const configPath = path.join(vscode.workspace.rootPath || '', 'rcon-config.json');
    outputChannel.appendLine(`Attempting to load RCON config from: ${configPath}`);

    try {
        if (fs.existsSync(configPath)) {
            const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            outputChannel.appendLine('RCON config loaded successfully from file');
            return { 
                password: password || fileConfig.rconPassword,
                ip: ip || fileConfig.rconIp,
                port: port || fileConfig.rconPort || 27015
            };
        }
    } catch (error) {
        outputChannel.appendLine(`Error reading RCON config file: ${error.message}`);
        vscode.window.showErrorMessage(`Error reading RCON config file: ${error.message}`);
    }
    outputChannel.appendLine('RCON config not found in settings or file');
    return { password, ip, port };
}

// Sets the RCON password
async function setRconPassword() {
    const password = await vscode.window.showInputBox({
        prompt: 'Enter RCON Password',
        password: true // masks the input
    });

    if (password) {
        let config = vscode.workspace.getConfiguration('tf2rcon');
        await config.update('rconPassword', password, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('RCON Password has been set.');
    }
}

// Sets the RCON IP address
async function setRconIp() {
    const ip = await vscode.window.showInputBox({
        prompt: 'Enter RCON IP Address',
        placeHolder: 'e.g., 127.0.0.1'
    });

    if (ip) {
        let config = vscode.workspace.getConfiguration('tf2rcon');
        await config.update('rconIp', ip, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('RCON IP Address has been set.');
    }
}

module.exports = {
    loadRconConfig,
    setRconPassword,
    setRconIp
};
