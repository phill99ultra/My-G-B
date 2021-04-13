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
            js    : `${source_folder}/js/*.js`,
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
    autoprefixer            = require('autoprefixer-stylus'),
    del                     = require('del'),
    clean_css               = require('gulp-clean-css'),
    group_media_queries     = require('gulp-group-css-media-queries'),
    uglify                  = require('gulp-uglify-es').default,
    webp_html               = require('gulp-webp-html'),
    webp_css                 = require('gulp-webp-css'),
    svg_sprite               = require('gulp-svg-sprite'),
    //project                 = parallel(js, html, styles)
    build                   = gulp.series(clean, html, images, parallel(styles, scripts)),
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
        .pipe(webp_html())      
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.img) 
        .pipe(
            plugin.webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            plugin.imagemin({
                interlaced: true,
                progressive: true,
                optimizationLevel: 5,
                svgoPlugins: [
                    {
                        removeViewBox: true
                    }
                ]
            })
        )      
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}

gulp.task('svg_sprite', ()=> {
    return gulp.src([`${source_folder}/iconsprite/*.svg`])
        .pipe(svg_sprite({
            mode: {
                stack: {
                   sprite: '../icons/icons.svg',
                   example: true 
                }
            }
        }))
        .pipe(dest(path.build.img))
});

function scripts() {
    return src(path.src.js)   
        .pipe(plugin.concat('main.js'))    
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(plugin.rename({
            extname: '.min.js'})
        ) 
        .pipe(dest(path.build.js)) 
        .pipe(browsersync.stream());
}

function watchFiles() {    
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], styles);
    gulp.watch([path.watch.js], scripts);
    gulp.watch([path.watch.img], images);
}

function clean() {
    return del(path.clean);
}

function styles() {
    return src(path.src.css)
        .pipe(plugin.stylus({            
            use: [rupture(), autoprefixer({overrideBrowserslist: ['last 5 versions']})]            
        }))  
        .pipe(group_media_queries()) 
        .pipe(webp_css())
        .pipe(dest(path.build.css))
        .pipe(clean_css())   
        .pipe(plugin.rename({
            extname: '.min.css'})
        )               
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
};

exports.styles  = styles;
exports.html    = html;
exports.scripts = scripts;
exports.images  = images;
// exports.project = project;
exports.build   = build;
exports.watch   = watch; 
exports.default = watch;

