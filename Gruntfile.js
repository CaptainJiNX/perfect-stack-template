/* jshint camelcase:false */
module.exports = function (grunt) {
  // Loading all tasks:
  require('load-grunt-tasks')(grunt);

  var pkg = require('./package'),
      path = require('path'),
      modulename = pkg.title || pkg.name;

  /**
   * HTML Minify Options
   */
  var htmlMinOptions = {
    removeComments: true,
    // removeCommentsFromCDATA: true,
    collapseWhitespace: true,
    removeEmptyAttributes: false,
    collapseBooleanAttributes: true,
    // removeAttributeQuotes: true,
    removeRedundantAttributes: true
    // useShortDoctype: true,
    // removeOptionalTags: true
  };
  
  grunt.initConfig({
    pkg: pkg,
    modulename: modulename,
    
    /**
     * Manually added vendor files
     *
     * Put paths for libraries not installed via Bower,
     * or those without a `main` section in their bower.json here.
     * E.g. angular-i18n files.
     *
     * (Add both stylesheets and javascripts)
     */
    vendorFiles: [
      // e.g. "bower_components/angular-i18n/angular-locale_sv-se.js"
    ],
    
    /**
     * Source dirs
     */
    dirs: {
      src: 'src',
      app: 'src/app',
      dist: 'dist',
      temp: '.tmp'
    },

    
    //todo:remove maybe
    /**
     * Banner for top of concatenated CSS and Javascript
     */
    meta: {
      banner: '/**\n' +
        ' * <%= modulename %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' */\n'
    },

    /**
     * Clean up
     */
    clean: {
      all: ['<%= dirs.dist %>', '<%= dirs.temp %>'],
      dist: '<%= dirs.dist %>',
      temp: '<%= dirs.temp %>'
    },

    /**
     * Server
     */
    connect: {
      options: {
        port: 1337,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          livereload: true,
          open: true,
          base: [
            'bower_components',
            '<%= dirs.temp %>',
            '<%= dirs.app %>',
            '<%= dirs.dist %>'
          ]
        }
      },
      dist: {
        options: {
          keepalive: true,
          base: [
            '<%= dirs.dist %>'
          ]
        }
      }
    },

    /**
     * Watch files and do stuff
     */
    watch: {
      templates: {
        files: ['<%= dirs.app %>/*/{,*/}*.html'],
        tasks: ['html2js:app', 'injector:app']
      },
      index: {
        files: ['<%= dirs.app %>/index.html'],
        tasks: ['injector:app', 'copy:index']
      },
      app: {
        files: ['<%= dirs.app %>/**/*.js', '!<%= dirs.app %>/**/*.spec.js'],
        tasks: ['injector:app', 'newer:jshint:app']
      },
      livereload: {
        options: {
          livereload: true
        },
        files: [
          '<%= dirs.temp %>/index.html',
          '<%= dirs.app %>/**/*.js',
          '<%= dirs.temp %>/*.js',
          '!<%= dirs.app %>/**/*.spec.js'
        ]
      }
    },

    

    /**
     * Minify HTML templates for dist
     */
    htmlmin: {
      dist: {
        options: htmlMinOptions,
        files: {
          '<%= dirs.dist %>/index.html': '<%= dirs.temp %>/index.html'
        }
      }
    },

    /**
     * Compile AngularJS html templates to Javascript and inject into $templateCache
     */
    html2js: {
      options: {
        module: '<%= modulename %>Templates',
        base: '<%= dirs.app %>',
        rename: function (template) {
          return '/' + modulename + '/' + template;
        }
      },
      app: {
        files: [{
          expand: true,
          cwd: '<%= dirs.app %>',
          src: ['**/*.html', '!index.html'],
          dest: '<%= dirs.temp %>',
          rename: function () {
            return '<%= dirs.temp %>/<%= modulename %>Templates.js';
          }
        }]
      },
      dist: {
        options: {
          htmlmin: htmlMinOptions
        },
        files: [{
          expand: true,
          cwd: '<%= dirs.app %>',
          src: ['**/*.html', '!index.html'],
          dest: '<%= dirs.temp %>',
          rename: function () {
            return '<%= dirs.temp %>/<%= modulename %>Templates.js';
          }
        }]
      }
    },

    /**
     * Dependency injection annotation for AngularJS modules
     */
    ngmin: {
      dist: {
        src: [ '<%= dirs.dist %>/<%= modulename %>.js' ],
        dest: '<%= dirs.dist %>/<%= modulename %>.annotated.js'
      }
    },

    /**
     * Minify Javascripts
     */
    uglify: {
      dist: {
        options: {
          banner: '<%= meta.banner %>'
        },
        files: {
          '<%= dirs.dist %>/<%= modulename %>.min.js': [ '<%= dirs.dist %>/<%= modulename %>.annotated.js' ]
        }
      },
      vendors: {
        files: {
          '<%= dirs.dist %>/vendors.min.js': [ '<%= dirs.dist %>/vendors.js' ]
        }
      }
    },

    /**
     * The Karma configurations.
     */
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        background: true
      },
      continuous: {
        singleRun: true
      }
    },
    

    /**
     * The `injector` task injects all scripts/stylesheets into the `index.html` file
     */
    injector: {
      options: {
        destFile: '<%= dirs.temp %>/index.html'
      },

      /**
       * Inject application files and specs into karma config
       */
      karmaconf: {
        options: {
          destFile: 'karma.conf.js',
          starttag: '/** injector:{{ext}} **/',
          endtag: '/** endinjector **/',
          transform: function (file) { return '\'' + file.slice(1) + '\','; }
        },
        files: [
          {
            src: [
              'bower.json',
              'bower_components/angular-mocks/angular-mocks.js'
            ]
          },
          {
            src: '<%= vendorFiles %>'
          },
          {
            expand: true,
            cwd: '<%= dirs.app %>',
            src: ['<%= modulename %>.js', '**/index.js', '**/*.js', '!**/*.spec.js']
          },
          {
            expand: true,
            cwd: '<%= dirs.temp %>',
            src: ['*.js']
          },
          {
            expand: true,
            cwd: '<%= dirs.app %>',
            src: ['**/*.spec.js']
          }
        ]
      },

      /**
       * Inject all needed files during development to not
       * have to wait for minification, concatination, etc.
       */
      app: {
        options: {
          ignorePath: ['bower_components', '<%= dirs.app %>', '<%= dirs.temp %>']
        },
        files: [
          {src: ['bower.json']},
          {src: '<%= vendorFiles %>'},
          {
            expand: true,
            cwd: '<%= dirs.app %>',
            src: ['<%= modulename %>.js', '**/index.js', '**/*.js', '!**/*.spec.js']
          },
          {
            expand: true,
            cwd: '<%= dirs.temp %>',
            src: ['*.js', '**/*.css']
          }
        ]
      },

      /**
       * Collect all vendor files (to build a single vendors.js and vendors.css respectively)
       */
      vendors: {
        options: {
          destFile: '<%= dirs.temp %>/vendors.json',
          starttag: '"{{ext}}": [',
          endtag: ']',
          templateString: '{\n  "js": [],\n  "css": []\n}',
          transform: function (file, i, length) {
            return '  "' + file.slice(1) + '"' + (i + 1 < length ? ',' : '');
          }
        },
        files: [
          {src: ['bower.json']},
          {src: '<%= vendorFiles %>'}
        ]
      },

      /**
       * Use concatenated and minified sources for dist mode
       */
      dist: {
        options: {
          min: true,
          ignorePath: 'dist'
        },
        src: [
          '<%= dirs.dist %>/vendors.js',
          '<%= dirs.dist %>/vendors.css',
          '<%= dirs.dist %>/<%= modulename %>.js',
          '<%= dirs.dist %>/<%= modulename %>.css'
        ]
      }
    },

    copy: {
      index: {
        src: '<%= dirs.app %>/index.html',
        dest: '<%= dirs.temp %>/index.html'
      },
    },

    /**
     * Concat all source files
     */
    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      app: {
        src: [
          '<%= dirs.app %>/app.js',
          '<%= dirs.app %>/**/*.js',
          '<%= dirs.temp %>/*.js',
          '!<%= dirs.app %>/**/*.spec.js'
        ],
        dest: '<%= dirs.dist %>/<%= modulename %>.js'
      },
      vendors: {
        options: {
          banner: ''
        },
        files: {
          '<%= dirs.dist %>/vendors.js': ['<%= dirs.temp %>/vendors/*.js'],
          '<%= dirs.dist %>/vendors.css': ['<%= dirs.temp %>/vendors/*.css']
        }
      }
    },
    

    /**
     * Lint Javascript
     */
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      base: [
        'Gruntfile.js'
      ],
      app: {
        options: {
          jshintrc: '<%= dirs.app %>/.jshintrc'
        },
        files: [{
          expand: true,
          cwd: '<%= dirs.app %>',
          src: ['<%= modulename %>.js', '**/index.js', '**/*.js'],
          dest: '<%= dirs.app %>'
        }]
      }
    }
  });

  
  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['dist', 'connect:dist']);
    }
    grunt.task.run([
      'build',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'jshint:app',
    'html2js:app',
    'injector:karmaconf',
    'karma:continuous'
  ]);

  grunt.registerTask('build', [
    'clean:temp',
    'html2js:app',
    'jshint:app',
    'copy:index',
    'injector:app'
  ]);

  grunt.registerTask('dist', [
    'clean:all',
    'build_vendors',
    'html2js:dist',
    'concat:app',
    'jshint:app',
    'ngmin',
    'uglify',
    'copy:index',
    'injector:dist',
    'htmlmin:dist'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);

  /**
   * Vendor related tasks
   */
  grunt.registerTask('build_vendors', ['injector:vendors', 'copy_vendors', 'concat:vendors']);

  grunt.registerTask('copy_vendors', function () {
    grunt.task.requires('injector:vendors');

    var vendors = grunt.file.readJSON(grunt.config('dirs.temp') + '/vendors.json');

    if (!vendors) {
      grunt.log.warn('No vendors found, nothing to do');
      return false;
    }

    [].concat(vendors.js  || [])
      .concat(vendors.css || [])
      .forEach(function (file, i) {
        grunt.file.copy(file, grunt.config('dirs.temp') + '/vendors/' + ('000000' + i).slice(-7) + '_' + path.basename(file));
      });

    return true;
  });
};
