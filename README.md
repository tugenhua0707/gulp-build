## Gulp对项目打包(gulp构建之 mock data---模拟数据，转发请求数据)
#### 1. npm install (安装依赖包)
#### 2. gulp server -d  (开发环境打包)
#### 3. gulp  （生产环境打包）
### 项目的 目录结构如下：
<pre>
demo                                  # 项目名
|  |---app                            # 存放源文件                                
|  |  |--- html                       # 存放所有HTML页面
|  |  |   |--- index.html               
|  |  |   |--- questions.html
|  |  |   |--- results.html
|  |  |
|  |  |---json
|  |  |   |-- index.js               # 存放模拟数据的json文件 
|  |  | 
|  |  |--- images                     # 存放项目中用到的所有图片
|  |  |--- pages                      # 所有页面的文件
|  |  |    |--- page1                 # 具体的页面
|  |  |         |--- xx.js            # 单个页面的js文件
|  |  |         |--- xx.styl          # 单个页面的css文件
|  |  |    |--- page2 
|  |  |         |--- xx.js
|  |  |         |--- xx.styl
|  |  |--- libs                        # 存放项目中库文件
|  |  |--- common                      # 存放项目的组件
|  |  |
|  |--- build                          # 项目打包后的文件
|  |  |--- libs                        # 存放打包后的库文件 
|  |  |--- pages                       # 打包后的所有页面的文件
|  |  |    |---page1                   # 具体的单个页面的名称
|  |  |    |   |-- xx.js               # 单个的js文件
|  |  |    |   |-- xx.styl             # 单个的css文件
|  |  |    |
|  |  |    |---page2 
|  |  |    |   |-- xx.js
|  |  |    |   |-- xx.styl   
|  |  |                            
|  |  |--- index.html                  # 打包后的项目html文件放在项目的build根目录下
|  |  |--- questions.html
|  |  |--- results.html                           
|  |  |
|  |---- doc                               # 文档
|  |---- package.json                      # 依赖包配置
|  |---- README.md                         # 默认文档   
|  |---- gulpfile.js                       # 项目打包的gulpfile文件
|  |---- .gitignore                        # 提交到git上排除的一些文件 
|  |---- helper.js                         # 文件打包的一些配置
</pre>
<p>gulp-webserver NPM官网如（https://www.npmjs.com/package/gulp-webserver）</p>
<p>gulp-webserver 原理无非就是：模拟ajax数据(也可以叫拦截请求吧)，把请求转发到本地文件，所谓转发，就是
读取本地json文件，以json或者以script等格式返回给浏览器；在浏览器端我们就可以拿到json数据进行页面渲染等操作
</p>
<p>
  比如我现在的项目如上的目录，在app根目录下存放json文件目录，其中json目录下js对应的数据，在gulpfile.js
  的配置文件中使用gulp-webserver 创建本地服务器，使用配置项 middleware 进行请求转发；代码如下：
</p>
<pre>
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
</pre>
<p>
  1. 当服务器启动的时候(我这边设置端口为4000)，访问http://localhost:4000/build/index.html 就可以访问到页面，在该页面中的js发ajax请求，请求路径为 http://localhost:4000/index 就能返回json数据
  ，然后进行我们想要的操作，当然线上的文件也是一样的，我们可以设置他们相同的路径进行配置，或者我们可以判断是否是线上
  ，如果是线上的话，直接访问线上的ajax请求，如果是日常环境下，我们直接访问本地的json数据，当然他们的json数据是一样
  的，这样也就不依赖与服务器端，不会因为服务器端重启了，我们需要时间等待。
  当ajax请求的 时候，其实我们可以拦截请求，把请求转发到本地文件，然后本地可以编写j自己想要的son数据进行模拟，这样就不需要依赖于服务器端。具体的可以上面打包的demo。
</p>