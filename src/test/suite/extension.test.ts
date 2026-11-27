import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getMagentoVersionText } from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('detects Magento Community Edition version', () => {
		assert.equal(
			getMagentoVersionText({
				name: 'magento/project-community-edition',
				require: { 'magento/product-community-edition': '2.4.7' }
			}),
			'Magento 2: Community Edition 2.4.7'
		);
	});

	test('prefers the Enterprise Edition version and includes B2B', () => {
		assert.equal(
			getMagentoVersionText({
				name: 'magento/project-enterprise-edition',
				require: {
					'magento/project-enterprise-edition': '2.4.6',
					'magento/product-community-edition': '2.4.5',
					'magento/extension-b2b': '1.4.2'
				}
			}),
			'Magento 2: Enterprise Edition 2.4.6 with Installed B2B version 1.4.2'
		);
	});

	test('recognizes MageOS repositories and the Magento 2 CE package', () => {
		assert.equal(
			getMagentoVersionText({
				name: 'magento/project-community-edition',
				repositories: [{ url: 'https://repo.mage-os.org' }]
			}),
			'Magento 2: MageOS'
		);
		assert.equal(
			getMagentoVersionText({ name: 'magento/magento2ce' }),
			'Magento 2 CE'
		);
	});

	test('ignores non-Magento and malformed package names', () => {
		assert.equal(getMagentoVersionText({ name: 'vendor/project' }), undefined);
		assert.equal(getMagentoVersionText({ name: 'magento' }), undefined);
	});
});
