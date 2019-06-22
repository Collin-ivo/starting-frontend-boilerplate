// 'use strict';

const del = require(`del`);
const gulp = require(`gulp`);

const sass = require(`gulp-sass`);
const sassGlob = require(`gulp-sass-glob`);
// const less = require(`gulp-less`);
const plumber = require(`gulp-plumber`);
const postcss = require(`gulp-postcss`);
const autoprefixer = require(`autoprefixer`);
const server = require(`browser-sync`).create();
const mqpacker = require(`css-mqpacker`);
const minify = require(`gulp-clean-css`);
const rename = require(`gulp-rename`);
// const imagemin = require(`gulp-imagemin`);
const sourcemaps = require(`gulp-sourcemaps`);
// const mocha = require(`gulp-mocha`);
// const commonjs = require(`rollup-plugin-commonjs`);
const posthtml = require(`gulp-posthtml`);
const twig = require(`gulp-twig`);
const htmlmin = require(`gulp-htmlmin`);
const include = require(`posthtml-include`);
const uglify = require(`gulp-uglify`);
const webpackStream = require(`webpack-stream`);
const webpack = require(`webpack`);
const webpackConfig = require(`./webpack.config.js`);


// Обработка скриптов
gulp.task(`clean-js`, () => {
  return del(`build/scripts/*.js`);
});

gulp.task(`scripts`, () => {
  return gulp.src(`src/scripts/*.js`)
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe(gulp.dest(`build/scripts/`))
    .pipe(uglify())
    .pipe(rename({suffix: `.min`}))
    .pipe(gulp.dest(`build/scripts/`));
});
gulp.task(`copy-api`, () => {
  return gulp.src([
    `src/scripts/api.js`,
    `src/scripts/frontend-debug-menu.js`,
    `src/scripts/vendor/**/*.js`])
    .pipe(plumber())
    .pipe(gulp.dest(`build/scripts/`));
});

// Обработка html файлов
gulp.task(`clean-html`, () => {
  return del(`build/*.html`);
});

gulp.task(`copy-html`, () => {
  return gulp.src([`src/pages/*.html`, `src/pages/*.twig`])
    .pipe(twig())
    .pipe(posthtml([include({root: `./src/`})]))
    .pipe(gulp.dest(`build/`));
});

gulp.task(`min-html`, () => {
  return gulp.src(`build/*.html`)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(`build/`));
});

// Обработка стилей
gulp.task(`css`, () => {
  return gulp.src(`src/styles/*.scss`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      mqpacker({sort: true})
    ]))
    .pipe(gulp.dest(`build/css`))
    .pipe(minify())
    .pipe(rename(`style.min.css`))
    .pipe(sourcemaps.write(`.`))
    .pipe(gulp.dest(`build/css`))
    .pipe(server.stream());
});


// Простое копирование содержимого assets
gulp.task(`clean-assets`, () => {
  return del(`build/assets`);
});

gulp.task(`assets`, () => {
  return gulp.src([
    `src/assets/**/*.*`
  ], {
    base: `src`
  })
    .pipe(gulp.dest(`build/`));
});

gulp.task(`test`, () => {
});

// Галп сервер
gulp.task(`server`, () => {
  server.init({
    server: `build/`,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.task(`refresh`, (done) => {
    server.reload();
    done();
  });

  gulp.watch([`src/styles/**/*.scss`,
    `src/blocks/**/*.scss`], gulp.series(`css`));

  gulp.watch([`src/pages/**/*.html`,
    `src/pages/**/*.twig`,
    `src/blocks/**/*.html`,
    `src/blocks/**/*.twig`], gulp.series(`clean-html`, `copy-html`, `min-html`, `refresh`));

  gulp.watch(`src/scripts/**/*.js`, gulp.series(`clean-js`, `scripts`, `copy-api`, `refresh`));
  gulp.watch(`src/assets/**/*.*`, gulp.series(`clean-assets`, `assets`));
});

// Очистка папки билда
gulp.task(`clean`, () => {
  return del(`build`);
});


gulp.task(`build`, gulp.series(`clean`, `assets`, `css`, `copy-html`, `copy-api`, `min-html`, `scripts`));
gulp.task(`start`, gulp.series(`build`, `server`));
