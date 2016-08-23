var chalk;
var matchdep;
var module;
var saveLicense;

matchdep = require('matchdep');
chalk = require('chalk');
saveLicense = require('uglify-save-license');

module.exports = function(grunt) {
    var buildTasks;
    var config;
    var devTasks;
    var pkg;
    var prodTasks;
    var rewrite;
    var secret;

    pkg = grunt.file.readJSON('package.json');
    config = grunt.file.readYAML('grunt.yml').config;
    secret = grunt.file.readYAML('secret.yml').secret;
    rewrite = require('connect-modrewrite');

    grunt.initConfig({
        pkg: pkg,
        ngtemplates: {
            options: {
                module: config.files.templates.module
            },
            app: {
                cwd: config.files.templates.cwd,
                src: config.files.templates.src,
                dest: config.files.templates.dest
            }
        },
        connect: {
            client: {
                options: {
                    base: 'web',
                    port: secret.port,
                    hostname: '*',
                    livereload: config.liveReloadPort,
                    // http://danburzo.ro/grunt/chapters/server/
                    middleware: function(connect, options, middlewares) {
                        var rules = [];
                        // mod-rewrite behavior
                        rules = [
                            '!\\.html|\\.js|\\.css|\\.pdf|\\.mp4|\\.jp(e?)g|\\.png|\\.eot|\\.svg|\\.ttf|\\.woff|\\.woff2|\\.gif$ /index.html'
                        ];
                        // add rewrite as first item in the chain of middlewares
                        middlewares.unshift(rewrite(rules));
                        return middlewares;
                    }
                }
            }
        },
        concat: {
            scss: {
                src: config.files.scss.concat.src,
                dest: config.files.scss.concat.dest
            },
            'js-app': {
                options: {
                    sourceMap: true
                },
                src: [config.files.js.app.src, config.files.templates.dest],
                dest: config.files.js.app.dest
            },
            'js-vendor': {
                options: {
                    sourceMap: false
                },
                src: config.files.js.vendor.src,
                dest: config.files.js.vendor.dest
            }
        },
        uglify: {
            options: {
                sourceMap: true,
                sourceMapIncludeSources: true,
                banner: '/*\n' +
                '*    Built by                                           \n' +
                '*                               ____   _____            \n' +
                '*      __  __________    ____ _/ / /  / __(_)   _____   \n' +
                '*     / / / / ___/ _ \\  / __ `/ / /  / /_/ / | / / _ \\  \n' +
                '*    / /_/ (__  )  __/ / /_/ / / /  / __/ /| |/ /  __/  \n' +
                '*    \\__,_/____/\\___/  \\__,_/_/_/  /_/ /_/ |___/\\___/   \n' +
                '*                                                       \n' +
                '* \n' +
                '*    http://useallfive.com                                                                \n' +
                '*\n' +
                '*    <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> \n' +
                '*/'
            },
            'js-app': {
                src: config.files.js.app.dest,
                dest: config.files.js.app.dest
            },
            'js-vendor': {
                options: {
                    banner: '',
                    preserveComments: saveLicense
                },
                src: config.files.js.vendor.dest,
                dest: config.files.js.vendor.dest
            }
        },
        sass: {
            options: {
                loadPath: config.files.scss.loadPath,
                quiet: true,
                style: 'compact'
            },
            build: {
                src: config.files.scss.concat.dest,
                dest: config.files.scss.compilation.dest
            }
        },
        cssmin: {
            options: {
                sourceMap: false
            },
            target: {
                src: config.files.scss.compilation.dest,
                dest: config.files.scss.compilation.dest
            }
        },
        watch: {
            html: {
                files: ['web/index.unprocessed.html'],
                tasks: 'preprocess:dev'
            },
            livereload: {
                options: {
                    livereload: config.liveReloadPort,
                    interrupt: true
                },
                files: [
                    config.files.js.app.src,
                    config.files.scss.compilation.dest,
                    'web/**/*.html'
                ]
            },
            scss: {
                options: {
                    interrupt: true
                },
                files: config.files.scss.watch,
                tasks: ['concat:scss', 'sass']
            }
        },
        preprocess: {
            dev: {
                src: 'web/index.unprocessed.html',
                dest: 'web/index.html',
                options: {
                    context: {
                        PRODUCTION: 'false',
                        TESTING: 'true'
                    }
                }
            },
            preprod: {
                src: 'web/index.unprocessed.html',
                dest: 'web/index.html',
                options: {
                    context: {
                        PRODUCTION: 'true',
                        TESTING: 'true'
                    }
                }
            },
            build: {
                src: 'web/index.unprocessed.html',
                dest: 'web/index.html',
                options: {
                    context: {
                        PRODUCTION: 'true',
                        TESTING: 'false'
                    }
                }
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, cwd: 'web/assets/', src:['**'], dest: 'web/_build/assets/'},
                    {expand: false, src: 'web/index.html', dest: 'web/_build/index.html'},
                    {expand: false, src: 'web/_htaccess', dest: 'web/_build/_htaccess'}
                ]
            }
        },
        environments: {
            options: {
                local_path: 'web/_build'
            },
            staging: {
                options: {
                    deploy_path: secret.staging.path,
                    host: secret.staging.host,
                    username: secret.staging.username,
                    password: secret.staging.password,
                    debug: true,
                    releases_to_keep: '3',
                    after_deploy: 'cd ' + secret.staging.path + '/current/ && mv _htaccess .htaccess'
                }
            }
        }
    });

    grunt.registerTask('keepBanners', 'Moves banners to the top of the vendor file', function() {
        var MAX_LENGTH = 1000;
        var i;
        var licenses;
        var matches;
        var vendor;
        var vendorData;

        vendor = config.files.js.vendor.dest;
        vendorData = grunt.file.read(vendor);
        matches = vendorData.match(/\/\*[\s\S]+?\*\//g);
        MAX_LENGTH = 1000;
        licenses = '';
        i = matches.length;

        vendorData = vendorData.replace(matches, '');

        // Avoid dupes
        function inMatches(index, item) {
            var j = matches.length;
            while (j--) {
                if (j !== index && item === matches[j]) {
                    return true;
                }
            }
            return false;
        }

        while (i--) {
            if (matches[i].length < MAX_LENGTH) {
                vendorData = vendorData.replace(matches[i], '');
                if (!inMatches(i, matches[i])) {
                    licenses += matches[i] + '\n\n';
                }
            }
        }
        grunt.file.write(config.files.js.vendor.dest, licenses + vendorData);
    });

    matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    devTasks = [
        'concat:scss',
        'sass',
        'preprocess:dev',
        'connect:client',
        'watch'
    ];
    grunt.registerTask('default', devTasks);

    buildTasks = [
        'ngtemplates:app',
        'concat:scss',
        'sass',
        'cssmin:target',
        'concat:js-app',
        'concat:js-vendor',
        'uglify',
        'keepBanners',
        'preprocess:preprod',
        'copy',
        'connect:client',
        'watch'
    ];
    grunt.registerTask('build', buildTasks);

    prodTasks = [
        'ngtemplates:app',
        'concat:scss',
        'sass',
        'cssmin:target',
        'concat:js-app',
        'concat:js-vendor',
        'uglify',
        'keepBanners',
        'preprocess:build',
        'copy',
        'ssh_deploy:staging'
    ];
    grunt.registerTask('stage', prodTasks);
};
