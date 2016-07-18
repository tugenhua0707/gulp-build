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

if(DEBUGGER) {
  resProxy = "http://localhost:3000/build";
  prefix = "http://localhost:3000/build";
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
                prefix : /\@{3}PREFIX\@{3}/g
              },
              target : {
                resProxy : resProxy,
                prefix : prefix
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
            prefix : /\@{3}PREFIX\@{3}/g
          },
          target : {
            resProxy : resProxy,
            prefix : prefix
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
// 创建本地服务器，并且实时更新页面文件
gulp.task('browser-sync', ['css','html','browserify'],function() {
    var files = [
      '**/*.html',
      '**/*.css',
      '**/*.styl',
      '**/*.js'
    ]; 
    browserSync.init(files,{
   
        server: {
            //baseDir: "./html"
        }
        
    });
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
            prefix : /\@{3}PREFIX\@{3}/g
          },
          target : {
            resProxy : resProxy,
            prefix : prefix
          }
      }))
      .pipe(gulpif(!DEBUGGER, uglify()))
      .pipe(gulp.dest("./build/pages/"))
      .pipe(reload({stream:true}));
    };
});


gulp.task('default',['css','html','images','browserify'],function () {
    gulp.watch(["**/*.styl"], ['css','browserify']);
    gulp.watch("**/*.html", ['html','browserify']);
});

gulp.task('server', ['browser-sync','images'],function () {
    gulp.watch(["**/*.styl"], ['css','browserify']);
    gulp.watch("**/*.html", ['html','browserify']);
});