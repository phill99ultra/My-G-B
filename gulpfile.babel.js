const project_folder = 'build',
    source_folder  = 'src',
    path           = {
        build: {           
            pug  : `${project_folder}/`,
            css   : `${project_folder}/css/`,
            js    : `${project_folder}/js/`,
            img   : `${project_folder}/images/`,
            fonts : `${project_folder}/fonts/`,
        },
        src  : {            
            pug  : `${source_folder}/pug/**/*.pug`,
            css   : `${source_folder}/stylus/style.styl`,
            js    : `${source_folder}/js/**/*.js`,
            img   : `${source_folder}/images/**/*.{jpg,png,svg,ico,gif,wepb}`,
            fonts : `${source_folder}/fonts/*.{ttf,woff}`,
        },
        watch: {           
            pug  : `${source_folder}/pug/**/*.pug`,
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
    webp_css                = require('gulp-webp-css'),
    svg_sprite              = require('gulp-svg-sprite'),   
    fs                      = require('fs'),    
    build                   = gulp.series(clean, pug, parallel(styles, images, scripts, fonts)),
    watch                   = parallel(build, watchFiles, browserSync);

// Local server
function browserSync() {
    browsersync.init({
        server : {
            baseDir: `./${project_folder}/`
        },
        port   : 3344,
        notify : false
    });
}

// PUG
function pug() {
    return src(path.src.pug) 
        .pipe(plugin.plumber())
        .pipe(plugin.pug({ pretty: true }))     
        .pipe(dest(path.build.pug))
        .pipe(browsersync.stream());
}

// Images
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

// Fonts
function fonts() {
    return src(path.src.fonts)
        .pipe(plugin.ttf2woff())
        .pipe(dest(path.build.fonts))
}

// task for minify all svg files in one in build directory
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

gulp.task('otf2ttf', ()=> {
    return gulp.src(`${source_folder}/fonts/*.otf`)
        .pipe(plugin.fonter({
            formats: ['ttf']
        }))
        .pipe(dest(path.src.fonts))
});

function scripts() {
    return src(path.src.js)
        .pipe(plugin.sourcemaps.init({loadMaps : true}))
        .pipe(plugin.babel({
            presets: ['@babel/preset-env']
        }))          
        .pipe(plugin.concat('main.js'))    
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(plugin.rename({
            extname: '.min.js'})
        ) 
        .pipe(plugin.terser({ 
            output: { comments: false }})
        )
        .pipe(plugin.sourcemaps.write('./'))
        .pipe(dest(path.build.js)) 
        .pipe(browsersync.stream());
}

function watchFiles() {       
    gulp.watch([path.watch.pug], pug);
    gulp.watch([path.watch.css], styles);
    gulp.watch([path.watch.js], scripts);
    gulp.watch([path.watch.img], images);
}

function clean() {
    return del(path.clean);
}

function styles() {
    return src(path.src.css)
        .pipe(plugin.plumber())
        .pipe(plugin.sourcemaps.init())
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
        .pipe(plugin.sourcemaps.write('./'))           
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
};

// exports.fontsStyle = fontsStyle;
exports.fonts   = fonts;
exports.styles  = styles;
exports.pug     = pug;
exports.scripts = scripts;
exports.images  = images;
exports.build   = build;
exports.watch   = watch; 
exports.default = watch;

