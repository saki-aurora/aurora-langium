import type { PCM } from '../language/generated/ast.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { AuroraLanguageMetaData } from '../language/generated/module.js';
import { createAuroraServices } from '../language/aurora-module.js';
import { extractAstNode, extractDocument } from './cli-util.js';
import { generateJavaScript } from './generator.js';
import { NodeFileSystem } from 'langium/node';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createAuroraServices(NodeFileSystem).Aurora;
    const PCM = await extractAstNode<PCM>(fileName, services);
    const generatedFilePath = generateJavaScript(PCM, fileName, opts.destination);
    console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    destination?: string;
}

// New function to parse and display the AST
export const parseAction = async (fileName: string): Promise<void> => {
    const services = createAuroraServices(NodeFileSystem).Aurora;
    const document = await extractDocument(fileName, services);
    const parsed = document.parseResult;

    if (parsed.parserErrors.length > 0) {
        console.error(chalk.red('Parsing errors:'), parsed.parserErrors);
        process.exit(1);
    }

    console.log(chalk.green('Parsed AST:'));
    console.log(JSON.stringify(parsed.value, null, 2)); // Output the AST as formatted JSON
};

export default function(): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    const fileExtensions = AuroraLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file')
        .action(generateAction);

    // Add a new parse command to display the AST
    program
        .command('parse')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .description('parses the source file and outputs the AST as JSON')
        .action(parseAction);

    program.parse(process.argv);
}
