import path from 'path';

import { runTests } from 'vscode-test';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');
		const extensionTestsPath = path.resolve(__dirname, './suite');

		// The path to the extension test workspace
		const testWorkspace = path.resolve(
			__dirname,
			extensionDevelopmentPath + '/tests/workspace/',
		);

		const launchArgs = [
			testWorkspace,
			// This disables all extensions except the one being testing
			'--disable-extensions',
		];

		const extensionTestsEnv = {
			EXTENSION_MODE: 'development',
		};

		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs,
		//	extensionTestsEnv,
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();