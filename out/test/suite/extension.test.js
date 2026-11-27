"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = __importStar(require("vscode"));
const extension_1 = require("../../extension");
suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('detects Magento Community Edition version', () => {
        assert.equal((0, extension_1.getMagentoVersionText)({
            name: 'magento/project-community-edition',
            require: { 'magento/product-community-edition': '2.4.7' }
        }), 'Magento 2: Community Edition 2.4.7');
    });
    test('prefers the Enterprise Edition version and includes B2B', () => {
        assert.equal((0, extension_1.getMagentoVersionText)({
            name: 'magento/project-enterprise-edition',
            require: {
                'magento/project-enterprise-edition': '2.4.6',
                'magento/product-community-edition': '2.4.5',
                'magento/extension-b2b': '1.4.2'
            }
        }), 'Magento 2: Enterprise Edition 2.4.6 with Installed B2B version 1.4.2');
    });
    test('recognizes MageOS repositories and the Magento 2 CE package', () => {
        assert.equal((0, extension_1.getMagentoVersionText)({
            name: 'magento/project-community-edition',
            repositories: [{ url: 'https://repo.mage-os.org' }]
        }), 'Magento 2: MageOS');
        assert.equal((0, extension_1.getMagentoVersionText)({ name: 'magento/magento2ce' }), 'Magento 2 CE');
    });
    test('ignores non-Magento and malformed package names', () => {
        assert.equal((0, extension_1.getMagentoVersionText)({ name: 'vendor/project' }), undefined);
        assert.equal((0, extension_1.getMagentoVersionText)({ name: 'magento' }), undefined);
    });
});
//# sourceMappingURL=extension.test.js.map