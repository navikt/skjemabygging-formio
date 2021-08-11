#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const folder = process.argv[2]
const packagePath = path.join(root, folder)

const excludedDirs = ["node_modules", ".nais"]

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
      packages.push({name: packageJson.name, path: currentDir})
    }

  })
}

searchPath(packagePath, 'package.json')
process.stdout.write(JSON.stringify(packages))
