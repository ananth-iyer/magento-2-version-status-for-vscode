"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
const path_1 = require("path");
const fs_1 = require("fs");
let statusBarItem;
/**
 *
 * @ref https://github.com/microsoft/vscode-extension-samples/blob/master/statusbar-sample/src/extension.ts
 */
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate({ subscriptions }) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    const myCommandId = 'magento2version.inVsCodeVersion';
    console.log('Congratulations, thanks your extension "magento-2-version-in-vscode" is now active!');
    // Display a message box to the user
    // window.showInformationMessage(`Yeah, ${n} line(s) selected... Keep going!`);
    // Display a message box to the user
    statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left, 100);
    statusBarItem.command = myCommandId;
    subscriptions.push(statusBarItem);
    // Update status bar item based on events for multi root folder changes
    subscriptions.push(vscode_1.workspace.onDidChangeWorkspaceFolders(updateStatusBarItem));
    // item always up-to-date
    subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(updateStatusBarItem));
    subscriptions.push(vscode_1.window.onDidChangeTextEditorSelection(updateStatusBarItem));
    subscriptions.push(vscode_1.workspace.onDidOpenTextDocument(updateStatusBarItem));
    subscriptions.push(vscode_1.workspace.onDidCloseTextDocument(updateStatusBarItem));
    // update status bar item once at start
    updateStatusBarItem();
}
exports.activate = activate;
function updateStatusBarItem() {
    const editor = vscode_1.window.activeTextEditor;
    hideStatusBarItem();
    if (!editor) {
        hideStatusBarItem();
        return;
    }
    const resource = editor.document.uri;
    const folder = vscode_1.workspace.getWorkspaceFolder(resource);
    if (!folder) {
        hideStatusBarItem();
        return;
    }
    let text = folder.uri.fsPath;
    const p = path_1.join(text, 'composer.json');
    if (!fs_1.existsSync(p)) {
        hideStatusBarItem();
        return;
    }
    const cmp = require(p);
    const n = cmp.name.trim().split('/');
    if (typeof n[1] !== "string") {
        hideStatusBarItem();
        return;
    }
    if (n[0] !== 'magento') {
        hideStatusBarItem();
        return;
    }
    ;
    const req = cmp.require;
    let version;
    version = req['magento/product-community-edition'] || ' (Develop-version)';
    version = req['magento/project-enterprise-edition'] || version;
    if (req['magento/extension-b2b'] !== undefined) {
        version += ' with Installed B2B version ' + req['magento/extension-b2b'];
    }
    text = n[1]
        .replace('project-', '')
        .split('-')
        .map(word => word.charAt(0).toLocaleUpperCase() + word.slice(1))
        .join(' ') + ' ' + version;
    statusBarItem.text = 'Magento 2: ' + text;
    statusBarItem.tooltip = text;
    statusBarItem.show();
}
function hideStatusBarItem() {
    statusBarItem.text = '';
    statusBarItem.tooltip = '';
    statusBarItem.hide();
}
// this method is called when your extension is deactivated
function deactivate() {
    statusBarItem.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map