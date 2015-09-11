var path = require('path'),
    fs = require('fs-extra'),
    os = require('os'),
    exec = require('child_process').exec;

/**
 * 本文件是 Gruntfile.js 默认模板，请根据需要和注释提示自行修改
 */
module.exports = function (grunt) {

    var file = grunt.file;
    var task = grunt.task;
    var pathname = path.basename(__dirname);
    //var all_files = ['**/*.eot','**/*.otf','**/*.svg','**/*.ttf','**/*.woff','**/*.html','**/*.htm','**/*.js','**/*.less','**/*.css','**/*.png','**/*.gif','**/*.jpg','!node_modules'];
    var all_files = [ '**/*.css', 'test/**/*.css', '!mock/**/*', '!**/node_modules/**/*', '!**/build/**/*'];
    var js_files = ['*.js'];
    var test_files = ['**/*.css', '**/*.html'];

    // ======================= 配置每个任务 ==========================

    // 如果 Gruntfile.js 编码为 gbk，打开此注释
    // grunt.file.defaultEncoding = 'gbk';
    //
    grunt.initConfig({

        // 从 abc.json 中读取配置项
        pkg: grunt.file.readJSON('abc.json'),

        // 对build目录进行清理
        clean: {
            build: {
                src: 'build/*'
            }
        },

        /**
         * 将src目录中的KISSY文件做编译打包，仅解析合并，源文件不需要指定名称
         * 		KISSY.add(<名称留空>,function(S){});
         *
         * 		@link https://github.com/daxingplay/grunt-kmc
         * 		@link http://docs.kissyui.com/1.4/docs/html/guideline/kmc.html
         *
         * 只生成依赖关系表，不做合并
         * 在kmc.options中增加四个参数:
         *		depFilePath: 'build/mods.js',
         *		comboOnly: true,
         *		fixModuleName:true
         *		comboMap: true,
         *
         * 如果需要补全模块名，需要增加一个参数
         */
        kmc: {
            options: {
                packages: [
                    {
                        name: '<%= pkg.name %>',
                        path: './src/',
                        charset:'utf-8',
                        ignorePackageNameInUri:true
                    }
                ],
                depFilePath: 'src/mod.js',
                comboMap: true,
                fixModuleName: true,
                comboOnly: true
            },

            main: {
                files: [
                    {
                        // 这里指定项目根目录下所有文件为入口文件，自定义入口请自行添加
                        expand: true,
                        cwd: 'src/',
                        src: [ '**/*.js', '!Gruntfile.js', '!**/*-min.js', '!**/node_modules/**/*', '!**/build/**/*']
                    }
                ]
            }
        },

        // 将css文件中引用的本地图片上传CDN并替换url，默认不开启
        //mytps: {
        //	options: {
        //		argv: "--inplace"
        //	},
        //	all: [ 'src/**/*.css']
        //},

        // 静态合并HTML
        // https://npmjs.org/package/grunt-combohtml
        //combohtml:{
        //	options:{
        //		encoding:'utf8',
        //		replacement:{
        //			from:/src\//,
        //			to:'build/'
        //		},
        //		comboJS: false,
        //		comboCSS: false
        //	},
        //	main:{
        //      files: [
        //            {
        //                expand: true,
        //				cwd:'build',
        //				// 对'*.htm'文件进行HTML合并解析
        //                src: ['**/*.htm'],
        //                dest: 'build/',
        //                ext: '.htm'
        //            }
        //        ]
        //	}
        //},

        // FlexCombo服务配置
        // https://npmjs.org/package/grunt-flexcombo
        //
        // 注意：urls 字段末尾不能有'/'
        flexcombo:{
            // 生产模式的combo服务器，访问build目录下的文件，
            // 此时可以通过在页面url后面带?ks-debug来控制是否访问压缩后的文件和是否combo
            stage:{
                options:{
                    longPolling: true,
                    target:'build/',
                    urls:'/<%= pkg.group %>/<%= pkg.name %>/<%= pkg.version %>',
                    port:'<%= pkg.port %>',
                    servlet:'?',
                    separator:',',
                    charset:'utf8',
                    filter:{
                        // 覆盖掉flex-combo的默认配置
                        '-min\\.js$':'-min.js',
                        '-min\\.css$':'-min.css'
                    }
                }
            },
            // 开发模式的combo服务器，访问src目录下的文件，
            // 只访问压缩前的源文件，?ks-debug只能控制是否combo
            dev:{
                options:{
                    longPolling: true,
                    target:'src/',
                    urls:'/<%= pkg.group %>/<%= pkg.name %>/<%= pkg.version %>',
                    port:'<%= pkg.port %>',
                    servlet:'?',
                    separator:',',
                    charset:'utf8',
                    filter:{
                        '-min\\.js':'.js',
                        '-min\\.css':'.css'
                    }
                }
            }
        },

        // 编译LESS为CSS 
        // https://github.com/gruntjs/grunt-contrib-less
        less: {
            options: {
                paths: './'
            },
            main: {
                files: [
                    {
                        expand: true,
                        cwd:'src/',
                        src: ['**/*.less'],
                        dest: 'src/',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        cwd:'test/',
                        src: ['**/*.less'],
                        dest: 'test/',
                        ext: '.css'
                    }
                ]
            }
        },

        // 压缩JS https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            options: {
                banner: '/*! Generated by Clam: <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd hh:MM:ss") %> */\n',
                beautify: {
                    ascii_only: true
                }
            },
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'build/',
                        src: ['**/*.js', '!lib/**/*.js', '!**/*-min.js', '!src/**/*.js'],
                        dest: 'build/',
                        ext: '-min.js'
                    }
                ]
            }
        },

        // 压缩CSS https://github.com/gruntjs/grunt-contrib-cssmin
        cssmin: {
            main: {
//                files: [
//                    {
//                        expand: false,
//                        cwd: 'build/',
//                        src: ['**/*.css', '!lib/**/*.css', '!**/*-min.css', 'test/**/*.css'],
//                        dest: 'build/',
//                        ext: '-min.css'
//                    }
//                ]
            }
        },

        // 监听JS文件和LESS文件的修改
        watch: {
            'all': {
                //files: ['src/**/*.js','src/**/*.css','src/**/*.less'],
                files: ['src/**/*.js', 'src/**/*.less', '!src/mod.js', '!src/tv-lucky.js', 'test/**/*.css'],
                tasks: [ 'build' ]
            }
        },

        // 拷贝文件
        copy : {
            main: {
                files:[
                    {
                        expand:true,
                        src: js_files,
                        dest: 'build/src/',
                        cwd:'src/',
                        filter: 'isFile'
                    },

//                    {
//                        expand:true,
//                        src: test_files,
//                        dest: 'build/test/',
//                        cwd:'test/',
//                        filter: 'isFile'
//                    }
                ]
            }
        },

        //yo clam:page, yo clam:mod, yo clam:widget别名
        exec: {
            page: {
                command: 'yo clam:page'
            },
            widget: {
                command: 'yo clam:mod'
            },
            uitl: {
                command: 'yo clam:widget'
            }
        },

        // browserify
        browserify: {
            main: {
                files: {
                    'src/game.js': ['src/main.js'],
                    'build/game.js': ['src/main.js']
                }
            }
        }

    });

    // ======================= 载入使用到的通过NPM安装的模块 ==========================

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-kmc');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-flexcombo');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-browserify');

    // 这部分根据实际需要打开
    //grunt.loadNpmTasks('grunt-combohtml');
    //grunt.loadNpmTasks('grunt-css-combo');
    //grunt.loadNpmTasks('grunt-mytps');
    //grunt.loadNpmTasks('grunt-replace');

    // =======================  注册Grunt 各个操作 ==========================


    grunt.registerTask('page', '生成一个page', function() {
        task.run(['exec:page']);
    });

    grunt.registerTask('widget', '生成一个widget', function() {
        task.run(['exec:widget']);
    });

    grunt.registerTask('util', '生成一个util', function() {
        task.run(['exec:util']);
    });

    /**
     * 启动Demo调试时的本地服务
     */
    grunt.registerTask('server', '开启Demo调试模式', function(env) {
        if (!env || env === 'dev') {
            task.run(['flexcombo:dev', 'watch:all']);
        } else if (env === 'stage') {
            task.run(['flexcombo:stage', 'watch:all']);
        } else {
            console.log('没有对应模式的server环境');
            return;
        }
    });

    // 默认构建任务
    grunt.registerTask('build', '默认构建任务', function() {
        task.run(['clean:build', 'less', 'browserify', 'copy', /*'replace', */'uglify', 'cssmin']);
    });

    /*
     * 获取当前库的信息
     **/
    grunt.registerTask('info', '获取库的路径', function() {
        var abcJSON = {};
        try {
            abcJSON = require(path.resolve(process.cwd(), 'abc.json'));
            console.log('\n'+abcJSON.repository.url);
        } catch (e){
            console.log('未找到abc.json');
        }
    });

    /*
     * 设置当前的分支号，x/y/z
     * */
    grunt.registerTask('setbranch', '设置abc.json中的分支号', function(version) {
        var done = this.async();
        var abcJSON = {};
        var doneFlag = 0;
        grunt.log.write(('设置分支为：daily/' + version).green);
        grunt.config.set('currentBranch', version);
        // 回写入 abc.json 的 version
        try {
            abcJSON = require(path.resolve(process.cwd(), 'abc.json'));
            abcJSON.version = version;
            abcJSON.config = abcJSON.config.replace(/\d+\.\d+\.\d+/, version);
            fs.writeJSONFile("abc.json", abcJSON, function(err){
                if (err) {
                    console.log(err);
                    return;
                } else {
                    grunt.log.writeln("update abc.json.");
                    if (doneFlag === 1) {
                        done();
                    } else {
                        doneFlag++;
                    }
                }
            });
        } catch (e){
            console.log('未找到abc.json');
        }
        try {
            var content = fs.readFileSync(path.resolve(process.cwd(), 'src', 'config.js'), 'utf8');
            content = content.replace(/\d+\.\d+\.\d+/g, version);
            fs.writeFile('src/config.js', content, function(err) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    grunt.log.writeln("update src/config.js.");
                    if (doneFlag === 1) {
                        done();
                    } else {
                        doneFlag++;
                    }
                }
            });
        } catch (e) {
            console.log('未找到src/config.js');
            console.log(e);
        }
    });
};
