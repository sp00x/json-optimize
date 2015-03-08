module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    update_json: {
      options: {
        src: 'package.json',
        indent: "  "
      },
      bower: {
        src: 'package.json',
        dest: 'bower.json',
        fields: 'name, version, description, repository, license, keywords'
      }
    },

    concat: {
      dist: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %> by <%= pkg.author.name %> | License: <%= pkg.license %> | <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        src: [ 'src/*.js' ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        preserveComments: 'some',
        sourceMap: 'dist/<%= pkg.name %>.map',
        sourceMappingURL: 'dist/<%= pkg.name %>.map',
      },
      dist: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }

  });

  require('load-grunt-tasks')(grunt); // load all grunt tasks. Done!

  grunt.registerTask('default', ['update_json', 'concat', 'uglify']);

};
