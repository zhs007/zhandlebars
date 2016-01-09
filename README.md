# zHandlebars
**zHandlebars** 是一个基于 **Handlebars** 的项目生成器。

How
---
我们会需要根据一组模板生成一个初始项目，一般来说，目录复制，然后改一些小地方即可。

但还有可能生成的文件名和项目名有关系，目录结构可能也和项目名有关，甚至会根据一组不定数量的最终生成的文件等等。

而 **zHandlebars** 就是用来做这件事的。

我们基于模板引擎 **Handlebars** ，也就是说所有的语法和 **Handlebars** 一致，我们就是在 **Handlebars** 对一个文件处理的基础上，增加了一个组合配置文件，而且这个配置文件支持通配符，支持 **Handlebars** 语法。

这个配置文件我们用json的格式来保存：

```
[
  {"name": "{{projname_lc}}", "src": "", "type": "dir"},
  {"name": "{{projname_lc}}/bin/{{projname_lc}}.js", "src": "/main/bin/main.js", "type": "file"},
  {"name": "{{projname_lc}}/config.js", "src": "/main/config.js", "type": "file"},
  {"name": "{{projname_lc}}/package.json", "src": "/main/package.json", "type": "file"},
  {"name": "{{projname_lc}}/lib/*.js", "src": "/main/lib/*.js", "type": "file"},
  {"name": "{{projname_lc}}/src/*.js", "src": "/main/src/*.js", "type": "file"},
  {"name": "{{projname_lc}}/ctrl/*.js", "src": "/main/ctrl/*.js", "type": "file"}
]
```

上面可以看到，其实这个配置文件就是一个简单的json数组，每个元素是一条匹配条件，其中 name 表示目标文件或目录名，src 表示原始文件名，type 是类型，目前就 **dir**、**file**、**binfile** 3种，如果是 dir，就只是建目录而已，所以 src 可以给空字符串。

如果是 file ，这里支持通配符。

规则上，是会先把这个配置文件通过模板引擎 **Handlebars** 处理一轮，然后按顺序新建目录和文件，新建文件的时候，其实会自动把不存在的目录生成出来的，不需要特别处理目录。

有了配置文件和模板文件外，使用起来就非常简单了。

```
"use strict";

var path = require('path');
var zhandlebars = require('../lib/index');

let params = {projname: 'test', projname_lc: 'test'};
zhandlebars.procProj(params, path.join(__dirname, './zrestify.json'), path.join(__dirname, './'));
```

更新说明
---
* **ver 0.1.6**
 * json配置文件里支持 **jscode** ，可以在处理这个文件的时候执行一段js脚本，主要是用来处理批量的参数的。

* **ver 0.1.3**
 * 支持 **binfile** 类型，对于不需要模板处理的文件都可以这样设置，会快一些。


使用到的第三方库
---

* 使用 **[glob](https://github.com/isaacs/node-glob)** 做文件通配符处理。
* 使用 **[handlebars](https://github.com/wycats/handlebars.js/)** 模板做基本代码模板。