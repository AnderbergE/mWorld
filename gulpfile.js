// General requires
var gulp = require('gulp');
var connect = require('gulp-connect');
var util = require('gulp-util');

// Script requires
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

// Style requires
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');

// Asset requires
var imagemin = require('gulp-imagemin');


// Constants
var SRC = 'src/';
var AUDIO = SRC + 'audio/';
var IMAGE = SRC + 'img/';
var SCRIPT = SRC + 'script/';
var STYLE = SRC + 'style/';
var ALL = '**/*';
var DEST = 'build/';

var getBundleName = function () {
	var version = require('./package.json').version;
	var name = require('./package.json').name;
	return name.toLowerCase() + '.' + version + '.min';
};


// Tasks
gulp.task('assets', function() {
	return gulp.src([
			AUDIO + ALL + '.*',
			'!' + IMAGE + '**/separated/*.*', // Skip the separated files
			IMAGE + ALL + '.*',
			SRC + '*.js'
		], { base: SRC })
		.pipe(imagemin({ optimizationLevel: 2 })) // Minimize image sizes
		.pipe(gulp.dest(DEST));
});

gulp.task('html', function() {
	return gulp.src(SRC + ALL + '.html')
		.pipe(gulp.dest(DEST));
});

gulp.task('browserify', function() {
	var bundler = browserify('./' + SCRIPT + 'game.js', { debug: true });

	var bundle = function() {
		return bundler
			.bundle()
			.on('error', function (err) {
				util.beep();
				util.log(util.colors.red('Error: '), err.message);
				this.emit('end');
			})
			.pipe(source(getBundleName() + '.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			// Add transformation tasks to the pipeline here.
			//.pipe(uglify())
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(DEST));
	};

	return bundle();
});

gulp.task('lint', function() {
	return gulp.src(SCRIPT + ALL + '.js')
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('fail'))
		.on('error', function () { util.beep(); })
		.pipe(jshint.reporter('default'));
});

gulp.task('scripts', ['lint', 'browserify']);

gulp.task('styles', function() {
	return gulp.src(STYLE + 'style.less')
		.pipe(less({ compress: true }))
		.on('error', function (err) {
			util.beep();
			util.log(util.colors.red('Styles: '), err.message);
			this.emit('end');
		})
		.pipe(autoprefixer('last 2 version'))
		.pipe(gulp.dest(DEST));
});

gulp.task('watch', function() {
	gulp.watch([
		IMAGE + ALL + '.*',
		AUDIO + ALL + '.*',
		SRC + '*.js'
	], ['assets']);

	gulp.watch(SRC + ALL + '.html', ['html']);

	gulp.watch(SCRIPT + ALL + '.js', ['scripts']);

	gulp.watch(STYLE + ALL + '.less', ['styles']);
});

// Start server at: http://localhost:9000/index.html
gulp.task('connect', function() {
	connect.server({
		root: DEST,
		port: 9000
	});
});

gulp.task('default', ['assets', 'html', 'scripts', 'styles', 'watch', 'connect']);