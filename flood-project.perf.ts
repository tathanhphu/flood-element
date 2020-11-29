import { step, TestSettings, By, beforeAll, afterAll, Until, StepOptions } from '@flood/element'

let QTEST_CREDENTIALS = [];
for (let i = 31 ; i <= 40; i++) {
	const generatedName = `elite${i}`;
	QTEST_CREDENTIALS.push({
		username: `${generatedName}@${generatedName}.com`,
		password: 'admin123',
		url: `https://${generatedName}.staging.qtestnet.com/`,
		selectedProject: `${generatedName}`
	})
}

const waitTimeout = undefined; 
const repeatReloadLaunch = 10
//require('./test-data/qtest');
let count = 0;
const stepOptions: StepOptions = {
	waitTimeout: waitTimeout
}
export const settings: TestSettings = {
	userAgent: 'flood-chrome-test',
	//chromeVersion: 'stable',
	//device: Device.
	loopCount: 1,
	waitTimeout: waitTimeout,
	screenshotOnFailure: true,
	actionDelay: 2,
	ignoreHTTPSErrors: true,
	// Automatically wait for elements before trying to interact with them
	waitUntil: 'visible',
}
const INPUT_PARAM = Math.floor(Math.random() * Math.floor(QTEST_CREDENTIALS.length));// +(process.env.USER_INDEX || '0');
const qTestCredential = QTEST_CREDENTIALS[INPUT_PARAM];
// console.log(`== INPUT_PARAM: ${INPUT_PARAM}\r\n QTEST_CREDENTIALS ${JSON.stringify(QTEST_CREDENTIALS)}`);
console.log(`== qTestCredential ${JSON.stringify(qTestCredential)}`);
export default () => {
	beforeAll(async browser => {
//		const qTestCredential = QTEST_CREDENTIALS[USER];
		console.log('Go to qtest app ....')
		await browser.visit(qTestCredential.url);
	})

	afterAll(async browser => {
		await browser.takeScreenshot();
		console.log('Logout ....')
		await browser.click(By.xpath("//div[contains(@class, 'user-avatar')]"));
		await browser.click(By.xpath("//div[contains(@class, 'user-avatar')]//a[.='Log out']"))
	})
	step('[Step-1] Login to qTest', stepOptions, async browser => {
		
		const username = await browser.findElement(By.xpath(`//input[@id='userName']`));
		await username.sendKeys(qTestCredential.username);
		const password = await browser.findElement(By.xpath(`//input[@id='password']`));
		await password.sendKeys(qTestCredential.password);
		await browser.click(By.xpath(`//a[@id='loginButton']`));
		await browser.waitForNavigation();
		/*
		console.log(`Waiting Terminate Sessions dialog ...`);
		const terminateSessions = await browser.maybeFindElement(By.css('.modal-title'));
		console.log(`Terminate Sessions dialog is ${terminateSessions ? 'exists' : ''}`);
		
		if (terminateSessions) {
			const terminateIcons = await browser.findElements(By.css('.glyphicon-remove-circle'));
			if (terminateIcons && terminateIcons.length > 0) {
				await browser.click(terminateIcons[0]);
				await browser.click(By.id('reloginBtn'));
			}
		}
		//*/
		await browser.click(By.id('projectName'));
		const projects = await browser.findElements(By.css('.projectNameLink'));
		for (let i = 0; i < projects.length; i++) {
			const e = projects[i];
			const projectName = await e.text();
			if (-1 !== projectName.indexOf(qTestCredential.selectedProject)) {
				await browser.click(e);
				break;
			}
		}
	})

	// browser keyword can be shorthanded as "b" or anything that is descriptive to you.
	step('[Step-2] Goto Launch ', stepOptions, async browser => {
		await browser.takeScreenshot();
		
		await browser.click(By.id('#working-tab_test-execution_label'));
		// const testExecutionRoot = await b.findElement(By.id('#test-execution-tree-content'));
		const testCycles = await browser.findElements(By.xpath("//div[contains(@class, 'tree-row removable') and contains(@title, 'CL')]//span[contains(@class, 'icon-toscaTestEvent')]/.."));
		console.log(`Cycles:  ${(testCycles || []).length }`);
		
		if (testCycles) {
			testCycles.forEach(async e => {
				console.log(`== Element ${await e.text()}`);
				
			});
			await browser.click(testCycles[testCycles.length - 1]);
			await browser.click(By.partialVisibleText('Schedule'))
		}
		console.log(`== wait for new page ...`);

		await browser.waitForNewPage();
		
	})

	step('[Step-3] Go index page of Launch', stepOptions, async browser => {
		
		console.log(`== wait Tree loading ...`);
		const waitSpinner = await browser.maybeFindElement(By.xpath('//aut-spinner'))
		if (waitSpinner) {
			await browser.wait (Until.elementIsNotVisible(waitSpinner));
		}
		await browser.wait(Until.elementIsVisible(By.xpath("//div[contains(@class, 'right-box')]//td[contains(@class, 'text-truncate grid-item name-column')]")))

		await browser.click(By.xpath("//div[@class='dialog']//div[@title='Close']"))
		
		const alertBannerCloseBtn = await browser.maybeFindElement(By.xpath("//aut-banner-alert//button[@title='Close']/span[1]"));
		if (alertBannerCloseBtn) {
			await browser.click(alertBannerCloseBtn);
		}
	})

	step.repeat(repeatReloadLaunch, `[Step-4] Refesh Launch ${repeatReloadLaunch} times`,  async browser => {
		console.log(`Click reload ${++count}, user index ${qTestCredential.username}`);
		if (count % 2) {
			await browser.click(By.xpath("//button[.='JOBS']"))
		} else {
			await browser.click(By.xpath("//button[.='HOSTS']"))
		}
		//await b.click(By.css('.reload-page'))
		const listElements = await browser.findElements(By.xpath("//div[contains(@class, 'list-content table-body')]//tr[not(contains(., 'No items'))]"));
		console.log(`Number of job count ${listElements.length}`);		
	})
}
