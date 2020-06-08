'use strict';
const gulp = require('gulp');
const insert = require('gulp-insert');
const rename = require('gulp-rename');
const template = require('gulp-template');
const babel = require('gulp-babel');

// Compile all *.ejs files to pre-compiled templates and append *.js to the filename.
gulp.task('templates', () =>
  gulp.src('./src/**/*.ejs')
    .pipe(template.precompile({
      evaluate: /\{%([\s\S]+?)%\}/g,
      interpolate: /\{\{([\s\S]+?)\}\}/g,
      escape: /\{\{\{([\s\S]+?)\}\}\}/g,
      variable: 'ctx'
    }))
    .pipe(insert.prepend('Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports.default='))
    .pipe(rename({
      extname: '.ejs.js'
    }))
    .pipe(gulp.dest('lib'))
);

gulp.task('transpile-js', () =>
  gulp.src('./src/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest('lib'))
);