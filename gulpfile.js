"use strict";
var gulp = require("gulp"),
    run = require("run-sequence").use(gulp),
    cssbeautify = require("gulp-cssbeautify"),
    rename = require("gulp-rename"),
    webserver = require("browser-sync"),
    sass = require("gulp-sass"),
    imagemin = require("gulp-imagemin"),
    cssnano = require("gulp-cssnano"),
    rigger = require("gulp-rigger"),
    uglify = require("gulp-uglify"),
    watch = require("gulp-watch"),
    plumber = require("gulp-plumber"),
    rimraf = require("rimraf");

var path = {
    build: {
        html: "build/",
        css: "build/assets/css/",
        img: "build/assets/i/",
        fonts: "build/assets/fonts/"
    },
    src: {
        html: "src/*.{htm,html}",
        css: "src/assets/sass/*.scss",
        img: "src/assets/i/**/*.*",
        fonts: "src/assets/fonts/**/*.*"
    },
    watch: {
        html: "src/**/*.{htm,html}",
        css: "src/assets/sass/**/*.scss",
        img: "src/assets/i/**/*.*",
        fonts: "src/assets/fonts/**/*.*"
    },
    clean: "./build"
};
var config = {
    server: {
        baseDir: "build/"
    },
    tunnel: true,
    host: 'localhost',
    port: 3000,
    directoryListing: true,
    logPrefix: ''
};

gulp.task('webserver', function () {
    webserver(config);
});

gulp.task("clean", function (cb) {
    rimraf(path.clean, cb);
});

gulp.task("html:build", function () {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({
            stream: true
        }));
});

gulp.task("style:build", function () {
    return gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(sass())
        .pipe(cssbeautify())
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({
            stream: true
        }));
});

gulp.task('image:build', function () {
    return gulp.src(path.src.img) 
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(webserver.reload({
            stream: true
        }));
});

gulp.task('fonts:build', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', function (cb) {
    run(
        "clean",
        "html:build",
        "style:build",
        "fonts:build",
        "image:build", cb);
});

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.css], function(event, cb) {
        gulp.watch('src/assets/i/**/*.*', ['image:build']);
        gulp.start('style:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task("default", function (cb) {
    run(
        "clean",
        "build",
        "webserver",
        "watch", cb);
});