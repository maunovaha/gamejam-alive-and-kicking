module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,
    banner:
      '/**\n' +
      ' * @author         ' + pkg.author + ' (@maunovaha) <' + pkg.email + '>\n' +
      ' * @copyright      ' + 'Mauno Vähä. All rights reserved.' + '\n' +
      ' * @version        ' + pkg.version + '\n' +
      ' * \n' +
      ' * @description    ' + pkg.name + ' - ' + pkg.description + '\n' +
      ' */\n',
    jshint: {
      files: ['Gruntfile.js', 'src/main.js', 'src/core/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },
    connect: {
      dev: {
        options: {
          port: 3000,
          base: 'src'
        }
      },
      prod: {
        options: {
          port: 3000,
          base: 'dist'
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          name: 'main',
          mainConfigFile: 'src/scripts/main.js',
          out: '.temp/requirejs-task-out.js',
          // uglify task handles optimization correctly
          optimize: 'none'
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        // drop console.* commands from codes
        drop_console: true //,
        // beautify: true
      },
      dist: {
        files: {
          'dist/scripts/main.js': ['.temp/requirejs-task-out.js']
        }
      }
    },
    clean: ['dist', '.temp'],
    copy: {
      main: {
        files: [{
          src: [
            'index.html',
            'styles/**/*',
            'assets/**/*'
          ],
          cwd: 'src/',
          dest: 'dist/',
          expand: true
        }]
      },
      requirejs: {
        files: [{
          src: [
            'scripts/vendor/requirejs/require.js'
          ],
          cwd: 'src/',
          dest: 'dist/',
          expand: true
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Validate code quality
  grunt.registerTask('default', ['jshint']);

  // Starts development server
  grunt.registerTask('dev', [
    'connect:dev',
    'watch'
  ]);

  // Starts production server
  grunt.registerTask('prod', [
    'dist',
    'connect:prod:keepalive'
  ]);

  // Releases game under /dist
  grunt.registerTask('dist', [
    'clean',
    'jshint',
    'requirejs',
    'uglify',
    'copy'
  ]);

};
