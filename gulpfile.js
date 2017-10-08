const gulp = require('gulp'),
    sass = require('gulp-sass'),
    csso = require('gulp-csso'),
    browserSync = require('browser-sync').create(),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    htmlMin = require('gulp-html-minifier'),
    cleaner = require('gulp-clean'),
    imagemin = require('gulp-imagemin'),
    pug = require("gulp-pug"),
    autoprefixer = require('gulp-autoprefixer');

gulp.task('server', ['pug', 'sass', 'compress-js', 'compress-css-libs', 'compress-js-libs'], () => {
    browserSync.init({
        server: {
            baseDir: 'app'
        }
    });

    gulp.watch('app/js/main.js', ['compress-js']);
    gulp.watch('app/sass/layout/*.scss', ['sass']);
    gulp.watch('app/sass/*.scss', ['sass']);
    gulp.watch('app/*.pug', ['pug']);
    gulp.watch('app/*.html').on('change', browserSync.reload);
});

gulp.task('pug', () => { 
    return gulp.src('app/*.pug')            
    .pipe(pug())                                           
    .pipe(gulp.dest('app/'))                           
                     
});

gulp.task('sass', () => {
    return gulp.src('app/sass/main.scss')
        .pipe(sass({
			includePaths: require('node-bourbon').includePaths
		}).on('error', sass.logError))
        .pipe(csso())
        .pipe(concat('main.min.css'))
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream());
});

gulp.task('compress-css-libs', () => {
    return gulp.src([
            'app/lib/font-awesome/css/font-awesome.min.css',
            'app/lib/animate/animate.css',
            'app/lib/OwlCarousel/dist/assets/owl.carousel.min.css'
        ])
        .pipe(concat('libs.min.css'))
        .pipe(csso())
        .pipe(gulp.dest('app/css'));
});


gulp.task('compress-js-libs', (cb) => {
    pump([
            gulp.src([
                'app/lib/jquery/dist/jquery.min.js',
                'app/lib/wow/dist/wow.min.js',
                'app/lib/OwlCarousel/dist/owl.carousel.min.js'
            ]),
            concat('libs.min.js'),
            uglify(),
            gulp.dest('app/js')
        ],
        cb);
});

gulp.task('compress-js', (cb) => {
    pump([
            gulp.src('app/js/main.js'),
            concat('main.min.js'),
            babel({
                presets: ['es2015']
            }),
            uglify(),
            gulp.dest('app/js'),
            browserSync.stream()
        ],
        cb
    );
});

gulp.task('default', ['server']);

gulp.task('dist-css', () => {
    return gulp.src('app/css/*.css').pipe(gulp.dest('dist/css'));
});

gulp.task('dist-html', () => {
    return gulp.src('app/*.html')
        .pipe(htmlMin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('dist-js', () => {
    return gulp.src('app/js/*.js')
        .pipe(gulp.dest('dist/js'));
});

gulp.task('dist-fonts', () => {
    return gulp.src([
        'app/fonts/**/*.eot',
        'app/fonts/**/*.ttf',
        'app/fonts/**/*.woff',
        'app/fonts/**/*.svg'
    ]).pipe(gulp.dest('dist/fonts'));
});

gulp.task('dist-img', () => {
    return gulp.src([
        'app/img/*.svg',
        'app/img/*.jpg',
        'app/img/*.png'
    ])
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});

gulp.task('dist', ['dist-html', 'dist-css', 'dist-fonts', 'dist-js', 'dist-img']);

gulp.task('remove-dist', () => {
    return gulp.src('dist')
        .pipe(cleaner({
            read: false
        }));
});