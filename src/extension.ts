// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, StatusBarAlignment, window, StatusBarItem, workspace } from 'vscode';
import { join as joinPath } from 'path';
import { existsSync } from 'fs';

let statusBarItem: StatusBarItem;

/**
 *
 * @ref https://github.com/microsoft/vscode-extension-samples/blob/master/statusbar-sample/src/extension.ts
 */

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	const myCommandId = 'magento2version.inVsCodeVersion';
	console.log('Congratulations, thanks your extension "magento-2-version-in-vscode" is now active!');

	// Display a message box to the user
	// window.showInformationMessage(`Yeah, ${n} line(s) selected... Keep going!`);
	// Display a message box to the user
	statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
	statusBarItem.command = myCommandId;

	subscriptions.push(statusBarItem);

	// Update status bar item based on events for multi root folder changes
    subscriptions.push(workspace.onDidChangeWorkspaceFolders(updateStatusBarItem));
	// item always up-to-date
	subscriptions.push(window.onDidChangeActiveTextEditor(updateStatusBarItem));
	subscriptions.push(window.onDidChangeTextEditorSelection(updateStatusBarItem));
	subscriptions.push(workspace.onDidOpenTextDocument(updateStatusBarItem));
    subscriptions.push(workspace.onDidCloseTextDocument(updateStatusBarItem));

	// update status bar item once at start
	updateStatusBarItem();
}

function updateStatusBarItem(): void {
	const editor = window.activeTextEditor;
	hideStatusBarItem();

	if (!editor) {
		hideStatusBarItem();
		return;
	}

	const resource = editor.document.uri;
	const folder = workspace.getWorkspaceFolder(resource);
	if (!folder) {
		hideStatusBarItem();
		return;
	}

	let text = folder.uri.fsPath;
	const p = joinPath(text, 'composer.json');
	if (!existsSync(p)) {
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
	};

    if (cmp.name === 'magento/magento2ce') {
        let name = 'Magento 2 CE';
        statusBarItem.text = name;
        statusBarItem.tooltip = name;
        statusBarItem.show();
        return;
    }

    let version = '';
    const repositories = cmp.repositories;
	const req = cmp.require;

	version = req['magento/product-community-edition'] || '';

	version = req['magento/project-enterprise-edition'] || version;

    let name = '';
    for (const repo of repositories) {
        if (repo['url'].search('mage-os') >= 0) {
            name = 'MageOS';
            break;
        }
    }

    if (!name) {
        name = n[1]
            .replace('project-', '')
            .split('-')
            .map(word => word.charAt(0).toLocaleUpperCase() + word.slice(1))
            .join(' ');
    }


	if (req['magento/extension-b2b'] !== undefined) {
		version += ' with Installed B2B version ' + req['magento/extension-b2b'];
	}

	if (version === undefined && name === '') {
		version = '';
		name = '';
        statusBarItem.text = '';
        statusBarItem.tooltip = '';
        statusBarItem.hide();
        return;
	}

	text = name + ' ' + (version !== undefined ? version : '');
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
export function deactivate() {
	statusBarItem.dispose();
}
