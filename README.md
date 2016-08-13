## Gulp对项目打包
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
