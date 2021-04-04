const project_folder = 'build',
    source_folder  = 'src',
    path           = {
        build: {
            html  : `${project_folder}/`,
            css   : `${project_folder}/css/`,
            js    : `${project_folder}/js/`,
            img   : `${project_folder}/images/`,
            fonts : `${project_folder}/fonts/`,
        },
        src  : {
            html  : `${source_folder}/*.html`,
            css   : `${source_folder}/stylus/style.styl`,
            js    : `${source_folder}/js/main.js`,
            img   : `${source_folder}/images/**/*.{jpg,png,svg,ico,gif,wepb}`,
            fonts : `${source_folder}/fonts/*.{ttf,woff}`,
        },
        watch: {
            html  : `${source_folder}/**/*.html`,
            css   : `${source_folder}/stylus/**/*.styl`,
            js    : `${source_folder}/js/**/*.js`,
            img   : `${source_folder}/images/**/*.{jpg,png,svg,ico,gif,wepb}`            
        },
        clean: `./${project_folder}/`
    },
    { src, dest, parallel } = require('gulp'),
    gulp                    = require('gulp'),
    plugin                  = require('gulp-load-plugins')(),
    rupture                 = require('rupture'),
    browsersync             = require('browser-sync').create(),
    del                     = require('del'),
    build                   = gulp.series(cleanDir, parallel(styles, html)),
    watch                   = parallel(build, watchFiles, browserSync);

function browserSync() {
    browsersync.init({
        server : {
            baseDir: `./${project_folder}/`
        },
        port   : 3344,
        notify : false
    });
}

function html() {
    return src(path.src.html)
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function watchFiles() {    
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], styles);
}

function cleanDir() {
    return del(path.clean)
}

function styles() {
    return src(path.src.css)
        .pipe(plugin.stylus({
            use: rupture(),
            compress: true
        }))
        .pipe(plugin.rename('style.min.css'))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
};

exports.styles  = styles;
exports.html    = html;
exports.build   = build;
exports.watch   = watch; 
exports.default = watch;

// const { src, dest, watch, parallel } = require('gulp'),
//     plugin          = require('gulp-load-plugins')(),
//     browserSync     = require('browser-sync').create();

// function styles() {
//     return src('./src/stylus/*.styl')
//         .pipe(plugin.stylus({
//             use: rupture(),
//             compress: true
//         }))
//         .pipe(plugin.rename('style.min.css'))
//         .pipe(dest('./build/css'))
//         .pipe(browserSync.stream())
// };

// function watching() {
//     watch(['./src/stylus/**/*.styl'], styles);
//     watch(['./build/*.html']).on('change', browserSync.reload)
// }

// exports.styles      = styles;
// exports.watching    = watching;
// exports.browsersync = browsersync;

// exports.default     = parallel(watching, browsersync);