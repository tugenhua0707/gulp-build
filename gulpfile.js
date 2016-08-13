var gulp = require('gulp');
var stylus = require('gulp-stylus');
var mincss = require('gulp-minify-css');
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var clean = require('gulp-clean');

var browserify = require("browserify");
var sourcemaps = require("gulp-sourcemaps");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var replace = require('gulp-str-replace');
var imagemin = require('gulp-imagemin');
var helper   = require('./helper')();
var reactify      = require('reactify');
var to5Browserify = require('6to5-browserify');
var streamify     = require('gulp-streamify');
var gulpif      = require('gulp-if');
var md5         = require('md5');
//自动刷新     
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;

var fs = require('fs');
var fileContent = fs.readFileSync('./package.json');
var jsonObj = JSON.parse(fileContent);

var argv = process.argv.pop();
var DEBUGGER = (argv === "-D" || argv === "-d") ? true : false;
/* 基础路径 */
var paths = {
  app       : "app", 
  images    : 'app/images',
  pages    : 'app/pages',
  build     :  "build"
}
var resProxy = "项目的真实路径";
var prefix = "项目的真实路径" + jsonObj.name;

var port = 4000;

if(DEBUGGER) {
  resProxy = "http://localhost:"+port+"/build";
  prefix = "http://localhost:"+port+"/build";
}
// 先清理文件
gulp.task('clean-css',function(){
    return gulp.src(paths.build + "**/*.css")
           .pipe(clean());
});

gulp.task('css', ['clean-css'],function () {
  return gulp.src([paths.app+'/pages/**/index.styl']) 
         .pipe(stylus())
         .pipe(replace({
            original : {
                resProxy : /\@{3}RESPREFIX\@{3}/g,
                prefix : /\@{3}PREFIX\@{3}/g,
                tbjAppVersion : /\@{3}TBJAPP_VERSION\@{3}/g
              },
              target : {
                resProxy : resProxy,
                prefix : prefix,
                tbjAppVersion : md5(jsonObj.version)
              }
          }))
         .pipe(gulpif(!DEBUGGER, mincss()))
         .pipe(gulp.dest(paths.build + "/pages"))
         .pipe(reload({stream:true}));
});

// 监听html文件的改变
gulp.task('html',function(){
    return gulp.src(paths.app + "/html/**/*.html")
      .pipe(replace({
        original : {
            resProxy : /\@{3}RESPREFIX\@{3}/g,
            prefix : /\@{3}PREFIX\@{3}/g,
            tbjAppVersion : /\@{3}TBJAPP_VERSION\@{3}/g
          },
          target : {
            resProxy : resProxy,
            prefix : prefix,
            tbjAppVersion : md5(jsonObj.version)
          }
       }))
      .pipe(gulp.dest(paths.build + "/"))
      .pipe(reload({stream:true})); 
});
// 对图片进行压缩
gulp.task('images',function(){
   return gulp.src(paths.images + "**/*")
          .pipe(imagemin())
          .pipe(gulp.dest(paths.build));
});
// 对libs 库文件 进行打包
gulp.task('libs',function(){
  return gulp.src(paths.app + "/libs/**/*.js")
         .pipe(gulpif(!DEBUGGER, uglify()))
         .pipe(gulp.dest(paths.build + "/libs"))
         .pipe(reload({stream:true})); 
});



// 解决js模块化及依赖的问题
gulp.task("browserify",['libs'],function () {

    var compileFiles = helper.getJsFiles(__dirname + '/app/pages/', true);
    for (var i = compileFiles.length - 1; i >= 0; i--) {
      var file = compileFiles[i];
      var b = browserify({
        entries: [__dirname + '/app/pages/' + file ],
        transform: [reactify, to5Browserify],
        debug:true
      })
      .bundle()
      .pipe(source(file))
      .pipe(buffer())
      .pipe(gulp.dest("./build/pages/"))
      .pipe(sourcemaps.write("."))
      .pipe(replace({
        original : {
            resProxy : /\@{3}RESPREFIX\@{3}/g,
            prefix : /\@{3}PREFIX\@{3}/g,
            tbjAppVersion : /\@{3}TBJAPP_VERSION\@{3}/g
          },
          target : {
            resProxy : resProxy,
            prefix : prefix,
            tbjAppVersion : md5(jsonObj.version)
          }
      }))
      .pipe(gulpif(!DEBUGGER, uglify()))
      .pipe(gulp.dest("./build/pages/"))
      .pipe(reload({stream:true}));
    };
});

// 模拟数据 使用gulp-webserver 创建本地服务器
var webserver = require('gulp-webserver');
var url = require('url');
var indexJSON = require('./app/json/index.js');
gulp.task('web-server',['css','html','browserify'],function(){
  gulp.src('./')
  .pipe(webserver({
    livereload: true,
    directoryListing: {
      enable: true,
      path: 'json'
    },
    port: port,
    fallback: '*.html',
    middleware: function(req,res,next) {
      var urlObj = url.parse(req.url,true);
      switch(urlObj.pathname) {
        case '/index':
         res.setHeader('Content-Type','application/json');
         res.end(JSON.stringify(indexJSON));
         return;

         case '/api/xx' :
          var data = {
             'isSuccess': true,
             data: [{}]
           };
           res.setHeader('Content-Type','application/json');
           res.end(JSON.stringify(data));
           return;
      }
      next();
    }
  }))
});

gulp.task('default',['css','html','images','web-server'],function () {
    gulp.watch(["**/*.styl"], ['css']);
    gulp.watch("**/*.html", ['html']);
});

gulp.task('server', ['images','web-server'],function () {
    gulp.watch(["**/*.styl"], ['css','browserify']);
    gulp.watch("**/*.html", ['html','browserify']);
});


