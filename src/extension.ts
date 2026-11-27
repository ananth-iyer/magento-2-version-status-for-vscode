import { existsSync, readFileSync } from 'fs';
import { join as joinPath } from 'path';
import { commands, env, ExtensionContext, StatusBarAlignment, StatusBarItem, window, workspace } from 'vscode';

const copyVersionCommand = 'magento-2-version-in-vscode.copyVersion';
let statusBarItem: StatusBarItem;
let currentVersionText = '';

interface ComposerJson {
	name?: string;
	require?: Record<string, string>;
	repositories?: Array<{ url?: string }> | Record<string, { url?: string }>;
}

/** Build the label displayed for a Magento or MageOS project. */
export function getMagentoVersionText(composer: ComposerJson): string | undefined {
	if (!composer.name) {
		return undefined;
	}

	const parts = composer.name.trim().split('/');
	if (parts.length !== 2 || parts[0] !== 'magento' || !parts[1]) {
		return undefined;
	}

	if (composer.name === 'magento/magento2ce') {
		return 'Magento 2 CE';
	}

	const requirements = composer.require ?? {};
	let version = requirements['magento/project-enterprise-edition']
		|| requirements['magento/product-community-edition']
		|| '';

	const repositories = Array.isArray(composer.repositories)
		? composer.repositories
		: Object.values(composer.repositories ?? {});
	const isMageOs = repositories.some(repository => repository?.url?.toLowerCase().includes('mage-os'));
	const name = isMageOs
		? 'MageOS'
		: parts[1]
			.replace('project-', '')
			.split('-')
			.map(word => word.charAt(0).toLocaleUpperCase() + word.slice(1))
			.join(' ');

	if (requirements['magento/extension-b2b'] !== undefined) {
		version += `${version ? ' ' : ''}with Installed B2B version ${requirements['magento/extension-b2b']}`;
	}

	return `Magento 2: ${name}${version ? ` ${version}` : ''}`;
}

export function activate(context: ExtensionContext): void {
	const { subscriptions } = context;
	const version = context.extension.packageJSON.version as string;
	const previousVersion = context.globalState.get<string>('installedVersion');
	if (previousVersion !== version) {
		void context.globalState.update('installedVersion', version);
		void window.showInformationMessage(`Welcome to Magento 2 version in VS Code${previousVersion ? ' — the extension has been updated' : ''}!`);
	}

	statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
	statusBarItem.command = copyVersionCommand;
	subscriptions.push(statusBarItem);
	subscriptions.push(commands.registerCommand(copyVersionCommand, async () => {
		if (currentVersionText) {
			await env.clipboard.writeText(currentVersionText);
		}
	}));

	subscriptions.push(workspace.onDidChangeWorkspaceFolders(updateStatusBarItem));
	subscriptions.push(window.onDidChangeActiveTextEditor(updateStatusBarItem));
	subscriptions.push(window.onDidChangeTextEditorSelection(updateStatusBarItem));
	subscriptions.push(workspace.onDidOpenTextDocument(updateStatusBarItem));
	subscriptions.push(workspace.onDidCloseTextDocument(updateStatusBarItem));
	const composerWatcher = workspace.createFileSystemWatcher('**/composer.json');
	subscriptions.push(composerWatcher);
	subscriptions.push(composerWatcher.onDidCreate(updateStatusBarItem));
	subscriptions.push(composerWatcher.onDidChange(updateStatusBarItem));
	subscriptions.push(composerWatcher.onDidDelete(updateStatusBarItem));
	updateStatusBarItem();
}

function updateStatusBarItem(): void {
	const editor = window.activeTextEditor;
	const activeFolder = editor && workspace.getWorkspaceFolder(editor.document.uri);
	// Prefer the active editor's workspace. With no editor, inspect workspace roots
	// so the status is available immediately after opening a project folder.
	const folders = activeFolder ? [activeFolder] : (workspace.workspaceFolders ?? []);

	for (const folder of folders) {
		const composerPath = joinPath(folder.uri.fsPath, 'composer.json');
		if (!existsSync(composerPath)) {
			continue;
		}

		try {
			const composer = JSON.parse(readFileSync(composerPath, 'utf8')) as ComposerJson;
			const label = getMagentoVersionText(composer);
			if (label) {
				currentVersionText = label;
				statusBarItem.text = label;
				statusBarItem.tooltip = `${label} (click to copy)`;
				statusBarItem.show();
				return;
			}
		} catch {
			// Ignore invalid composer.json files and try the next workspace folder.
		}
	}

	hideStatusBarItem();
}

function hideStatusBarItem(): void {
	currentVersionText = '';
	statusBarItem.hide();
}

export function deactivate(): void {
	statusBarItem?.dispose();
}
