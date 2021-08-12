#!/usr/bin/env node
import cp from 'child_process'
import path from 'path'

const currentScriptPath = process.argv[1]
const scriptDir = path.dirname(currentScriptPath)
const packageLocatorScript = path.join(scriptDir, 'package-locator.mjs')
const deployContextScript = path.join(scriptDir, 'deploy-context.mjs')

const args = process.argv.slice(2)
const dryRun = args.indexOf('--dry') > -1
const printHelp = args.indexOf('--help') > -1 || args.indexOf('-h') > -1

if (printHelp) {
  console.log("Usage: node prepare-production-build.mjs [--dry]")
  console.log()
  console.log("Calls script that finds all packages under folder named packages/, then runs deploy-context.mjs for each package.")
  console.log("Use option --dry for running this script without applying changes.")
  process.exit(0)
}

const deployContextArgs = ['--replace', '--absolute']
if (dryRun) {
  deployContextArgs.push('--dry')
}

const packages = JSON.parse(cp.execFileSync(packageLocatorScript, ['packages/']))
packages.forEach(pkg => {
  console.log()
  console.log(`Preparing ${pkg.name}...`)
  cp.execFileSync(deployContextScript, [pkg.path, ...deployContextArgs], {stdio: 'inherit'})
})
