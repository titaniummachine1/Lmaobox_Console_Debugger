let statusBarItem;
const vscode = require('vscode'); // Add this line to import the vscode module

function createStatusBar() {
    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBarItem.show();
    }
}

function updateStatusBar(statusText) {
    if (statusBarItem) {
        statusBarItem.text = statusText;
        statusBarItem.show();
    }
}

function disposeStatusBar() {
    if (statusBarItem) {
        statusBarItem.dispose();
        statusBarItem = null;
    }
}

module.exports = {
    createStatusBar,
    updateStatusBar,
    disposeStatusBar
};
