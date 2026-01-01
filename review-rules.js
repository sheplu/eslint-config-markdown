import { readdirSync } from "node:fs";
import { eslintMarkdownRules } from './eslint-markdown.js';

const logger = console;
const successExit = 0;
const errorExit = 1;

const fetchedRules = readdirSync('./remote/docs/rules').map(item => item.replace('.md', ''));
const rules = Object.keys(eslintMarkdownRules.rules).map(item => item.replace('markdown/', ''));

const onlyInfetchedRules = fetchedRules.filter(x => !rules.includes(x));
const onlyInRules = rules.filter(x => !fetchedRules.includes(x));

logger.log("Only in fetchedRules:", onlyInfetchedRules);
logger.log("Only in rules:", onlyInRules);


if (onlyInfetchedRules.length === 0 && onlyInRules.length === 0) {
	logger.log(`Same keys for rules ${fetchedRules.length}/${Object.keys(rules).length}`);
	process.exit(successExit)
} else {
	logger.log(`Different keys for rules ${fetchedRules.length}/${Object.keys(rules).length}`);
	process.exit(errorExit)
};
