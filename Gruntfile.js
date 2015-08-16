module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    buildDir: 'dist',

    banner: '/*!\n' +
        ' * Validetta (<%= pkg.homepage %>)\n' +
        ' * Version <%= pkg.version %> ( <%= grunt.template.today("dd-mm-yyyy") %> )\n'+
        ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
        ' * Copyright 2013-<%= grunt.template.today("yyyy") %> <%= pkg.author.name %> - <%= pkg.author.url %> \n' +
        ' */\n',
    clean: {
      dist: '<%= buildDir %>'
    },

    sync: {
      all: {
          options: {
          sync: ['version'],
          from: 'package.json',
          to: 'bower.json'
        }
      }
    },

    replace: {
      dist: {
        options: {
          patterns: [
            { match: 'version', replacement: '<%= pkg.version %>' }
          ]
        },
        files: [
          { expand: true, flatten: true, src: ['untracked/validetta.jquery.json'], dest: '' }
        ]
      }
    },

    sass: {
      dist: {
        files: {
          'src/validetta.css': 'src/validetta.scss'
        }
      }
    },

    concat: {
      css: {
        options: {
          stripBanners: true,
          banner: '<%= banner %>\n'
        },
        src: ['src/<%= pkg.name %>.css'],
        dest: '<%= buildDir %>/<%= pkg.name %>.css'
      },
      js: {
        options: {
          stripBanners: true,
          banner: '<%= banner %>\n'
        },
        src: ['src/<%= pkg.name %>.js'],
        dest: '<%= buildDir %>/<%= pkg.name %>.js'
      }
    },

    cssmin: {
      add_banner: {
        options: {
          banner: '<%= banner %>'
        },
        files: {
          '<%= buildDir %>/<%= pkg.name %>.min.css': ['src/<%= pkg.name %>.css']
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: '<%= buildDir %>/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.registerTask('default', 'build');
  grunt.registerTask('build', ['clean', 'sync', 'replace', 'sass', 'concat', 'cssmin', 'uglify']);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-npm2bower-sync');
  grunt.loadNpmTasks('grunt-replace');
};