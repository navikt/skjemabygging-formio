#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const args = process.argv.slice(2);

const packageFolder = args.find((arg) => !arg.startsWith('-'));
const packagePath = path.join(root, packageFolder);
const replaceFiles = args.indexOf('--replace') > -1;

const sharedPackages = [
    {name: "@navikt/skjemadigitalisering-shared-components", path: 'packages/shared-components'}
];
sharedPackages.forEach(packageSpec => {
    packageSpec.fileDep = "file:" + path.relative(packagePath, path.join(root, packageSpec.path))
});

const packageJsonFilename = path.join(packagePath, 'package.json');
const yarnLockFilename = path.join(packagePath, 'yarn.lock');
const jsonDataString = fs.readFileSync(
    packageJsonFilename,
    {encoding: 'utf-8', flag: 'r'});
const packageJson = JSON.parse(jsonDataString);
const deps = packageJson.dependencies;
const presentSharedPackages = sharedPackages.filter(packageSpec => packageSpec.name in deps);

function generateNewDeps(deps) {
    const newDeps = {...deps};
    presentSharedPackages.forEach((packageSpec) => {
        const depValue = newDeps[packageSpec.name];
        console.log('original depValue for', packageSpec.name, depValue);
        console.log('new dep value', packageSpec.fileDep);
        newDeps[packageSpec.name] = packageSpec.fileDep;
    });
    return newDeps;
}

function generateNewYarnLock(deps) {
    const result = [];
    presentSharedPackages.forEach(packageSpec => {
        const depValue = deps[packageSpec.name];
        result.push(`"${packageSpec.name}@${packageSpec.fileDep}":\n  version "${depValue}"`);
    });
    return result;
}

const newDeps = generateNewDeps(deps);
fs.writeFileSync(packageJsonFilename + '.new', JSON.stringify({...packageJson, dependencies: newDeps}, null, 2) + '\n');
if (replaceFiles) {
    fs.renameSync(packageJsonFilename, packageJsonFilename + '.backup');
    fs.renameSync(packageJsonFilename + '.new', packageJsonFilename);
    console.log(`moved original file to *.backup, and replaced it with *.new [${packageJsonFilename}]`);
}


const newLockEntries = generateNewYarnLock(deps);
const lockContent = fs.readFileSync(yarnLockFilename, {encoding: 'utf-8', flag: 'r'});
const updatedLockContent = lockContent + "\n" + newLockEntries.join("\n\n");
fs.writeFileSync(yarnLockFilename + '.new', updatedLockContent);
if (replaceFiles) {
    fs.renameSync(yarnLockFilename, yarnLockFilename + '.backup');
    fs.renameSync(yarnLockFilename + '.new', yarnLockFilename);
    console.log(`moved original file to *.backup, and replaced it with *.new [${yarnLockFilename}]`);
}

