// General requires
var gulp = require('gulp');
var connect = require('gulp-connect');
var util = require('gulp-util');

// Script requires
var browserify = require('browserify');
var transform = require('vinyl-transform');
var sourcemaps = require('gulp-sourcemaps');
var jshint = require('gulp-jshint');

// Style requires
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');

// Asset requires
var imagemin = require('gulp-imagemin');

// Production requires
var rename = require('gulp-rename');
var delet = require('del');
var replace = require('gulp-replace');

// Constants
var SRC = 'src/';
var AUDIO = SRC + 'audio/';
var IMAGE = SRC + 'img/';
var SCRIPT = SRC + 'script/';
var STYLE = SRC + 'style/';
var ALL = '**/*';
var DEST = 'build/';
var PRODUCTION = 'production/';

// Build related variables, are setup depending on build type.
var destination = DEST;
var optimize = false;

var getBundleName = function () {
	// var version = require('./package.json').version;
	// var name = require('./package.json').name;
	return 'game';
};


// Tasks
gulp.task('assets', function () {
	var value = gulp.src([
			AUDIO + ALL + '.*',
			'!' + IMAGE + '**/separated/*.*', // Skip the separated files
			IMAGE + ALL + '.*',
			SRC + '*.js'
		], { base: SRC });

	if (optimize) {
		value = value.pipe(imagemin({ optimizationLevel: 2 })); // Minimize image sizes
	}

	return value.pipe(gulp.dest(destination));		
});

gulp.task('html', function () {
	return gulp.src(SRC + ALL + '.html')
		.pipe(gulp.dest(destination));
});

gulp.task('browserify', function () {
	var browserified = transform(function(filename) {
		var b = browserify(filename);
		return b.bundle();
	});

	var bundle = gulp.src('./' + SCRIPT + 'game.js')
		.pipe(browserified);

	if (destination !== PRODUCTION) {
		bundle.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(sourcemaps.write('./'));
	}

	return bundle.pipe(gulp.dest(destination));
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
		.pipe(gulp.dest(destination));
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
		root: destination,
		port: 9000
	});
});

gulp.task('default', ['assets', 'html', 'scripts', 'styles', 'watch', 'connect'], function () {
	util.log(util.colors.green('All tasks have started!'));
});


// Production related.
gulp.task('setup-vars', function () {
	destination = PRODUCTION;
	optimize = true;
});

// Production related.
gulp.task('railsify-script', ['scripts'], function () {
	gulp.src(PRODUCTION + getBundleName() + '.js')
		.pipe(replace(/\'(?:img|audio)\/([^\']*)/gi, '\'<%= asset_path(\'$1\') %>'))
		.pipe(rename(function (path) { path.extname = ".js.erb"; }))
		.pipe(gulp.dest(PRODUCTION));
});

// Production related.
// When generating files designed to be used on the server, run this:
gulp.task('production', ['setup-vars', 'assets', 'html', 'styles', 'railsify-script'], function () {
	// Cleanup of old js files.
	delet([
		PRODUCTION + getBundleName() + '.js',
		PRODUCTION + getBundleName() + '.js.map'
	]);

	// Instructions for how to add the files in the server codebase.
	util.log(
		util.colors.green('\nYour files will be in ./production/\n') +
		'Copy audio/ to app/assets/audio/\n' +
		'Copy img/ to app/assets/images/\n' +
		'Copy ' + getBundleName() + '.js.erb to app/assets/javascripts/\n' +
		'Copy phaser.js and TweenMax.js to lib/assets/javascripts/\n\n' +
		'Do NOT copy html or css, if necessary, manually update:\n' +
		'app/views/application/index.html.erb or app/assets/stylesheets/game.css.scss\n'
	);
});