import { createAuroraServices } from '../language/aurora-module.js';
import { NodeFileSystem } from 'langium/node';
import { evaluate } from './interpreter.js';
import chalk from 'chalk';
import path from 'path';

export async function evaluateAction(fileName: string): Promise<void> {
    const services = createAuroraServices(NodeFileSystem).Aurora;
    const uri = path.resolve(fileName).toString();
    const document = await services.shared.workspace.LangiumDocuments.getOrCreateDocument({ uri });
    
    await services.shared.workspace.DocumentBuilder.build([document], { validationChecks: 'all' });
    
    // Check for validation errors
    const validationErrors = (document.diagnostics ?? []).filter(diag => diag.severity === 1);
    if (validationErrors.length > 0) {
        console.error(chalk.red('Validation errors:'));
        for (const error of validationErrors) {
            console.error(chalk.red(`  Line ${error.range.start.line + 1}: ${error.message}`));
        }
        return;
    }
    
    // Evaluate the document
    try {
        const results = evaluate(document);
        console.log(chalk.green('Evaluation results:'));
        for (const [name, value] of Object.entries(results)) {
            console.log(`  ${name} = ${value}`);
        }
    } catch (error) {
        console.error(chalk.red('Evaluation error:'), error instanceof Error ? error.message : 'Unknown error');
    }
}