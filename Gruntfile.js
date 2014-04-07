var source = 'src/';
var assets = 'assets/';
var build = 'build/';
// Also change in rule uglify and less

/*global module */
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; */\n',

		// Task configuration.
		// Javascript
		jshint: {
			options: { jshintrc: '.jshintrc' },
			files: ['Gruntfile.js', '<%= concat.dist.dest %>']
		},
		concat: {
			dist: { src: source + '**/*.js', dest: build + 'game.js' }
		},
		uglify: {
			dist: { files: { 'build/game.min.js': '<%= concat.dist.dest %>' } }
		},

		// CSS
		less: {
			dist: {
				options: { compress: true },
				files: { 'build/less.css': source + 'style/style.less' }
			}
		},
		autoprefixer: {
			dist: {
				src: build + 'less.css',
				dest: build + 'style.css'
			}
		},

		// Other
		copy: {
			dist: {
				files: [
					{
						expand: true, flatten: true, filter: 'isFile',
						src: [source + '*.html'],
						dest: build
					},
					{
						expand: true,
						src: [assets + '**/*'],
						dest: build
					}
				]
			}
		},
		connect: {
			server: {
				// http://localhost:9000/index.html
				options: {
					port: 9000,
					base: build
				}
			}
		},
		watch: {
			scripts: {
				files: ['<%= concat.dist.src %>'],
				tasks: ['concat', 'jshint', 'uglify']
			},
			less: {
				files: [source + 'style/*.less'],
				tasks: ['less', 'autoprefixer']
			},
			assets: {
				files: [source + '*.html', assets + '**/*'],
				tasks: ['copy']
			}
		},
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Default task.
	grunt.registerTask('default', [
		'concat', 'jshint', 'uglify',
		'less', 'autoprefixer',
		'copy', 'connect', 'watch'
	]);

};
