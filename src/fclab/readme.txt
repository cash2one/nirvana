fclab工具开发须知：
1、当新增一个工具时，需要
    （1）、在fclab下新增一个文件夹用来存放该工具相关的业务逻辑代码
    （2）、在fclab/html中增加一个该工具的html模板
    （3）、在fclab/service中增加一个js文件用于定义该工具相关的fbs接口
    （4）、在css/fclab下增加一个css文件用于定义该工具相关的样式

2、tpl中定义工具主内容的target名称为：fclab+工具名+Info。该工具名由getAuth时服务器从labtools字段中返回
	
3、初始化某一个工具的方法为:fclab.工具名.init(),注意定义该方法

4、所有的bubblesource定义都在fclab/common/bubbleSource.js中
5、所有的fail提示都在fclab/common/labFail.js中
6、右侧公共部分（反馈建议、帮助）的升级在fclab/common/labSide.js中
7、工具的公用方法定义在fclab/common/labLib.js中
8、所有的action定义在fclab/module.js中