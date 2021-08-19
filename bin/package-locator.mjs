#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const folder = process.argv[2]
const packagePath = path.join(root, folder)

const excludedDirs = ["node_modules", ".nais"]

const args = process.argv.slice(2)
const printHelp = args.indexOf('--help') > -1 || args.indexOf('-h') > -1

const pkg = (name, path) => ({name, path})
const stdoutFormat = array => JSON.stringify(array)

if (printHelp) {
  console.log("Usage: node package-locator.mjs <path-to-search>")
  console.log()
  console.log("Finds all package.json files recursively under given path, and writes a list of objects with package name and path to stdout.")
  console.log(`Example output: ${stdoutFormat([pkg("pkg-a", "/app/pkg-a"), pkg("pkg-b", "/app/pkg-b")])}`)
  console.log()
  console.log("Excluded directories:", JSON.stringify(excludedDirs))
  process.exit(0)
}

function parsePackageJson(filename) {
  const jsonDataString = fs.readFileSync(
    filename,
    {encoding: 'utf-8', flag: 'r'})
  return JSON.parse(jsonDataString)
}

const packages = []

function searchPath(startPath, targetFilename) {

  if (!fs.existsSync(startPath)) {
    console.log("no dir:", startPath)
    process.exit(1)
  }

  const files = fs.readdirSync(startPath)
  files.forEach(file => {
    const filename = path.join(startPath, file)
    const stat = fs.lstatSync(filename)
    if (stat.isDirectory() && !excludedDirs.includes(file)) {
      searchPath(filename, targetFilename) //recurse
    } else if (file === targetFilename) {
      const packageJson = parsePackageJson(filename)
      const currentDir = path.dirname(filename)
      packages.push(pkg(packageJson.name, currentDir))
    }

  })
}

searchPath(packagePath, 'package.json')
process.stdout.write(stdoutFormat(packages))
