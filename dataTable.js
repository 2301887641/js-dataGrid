function MonsterDataGrid(config) {
    this.init(config);
    return this;
}

MonsterDataGrid.config = {
    //设定容器唯一 id。id 是对表格的数据操作方法上是传递条件，它是表格容器的索引
    id: null,
    //表格列数组
    columns: [],
    //配置请求
    request: {
        //ajax类型
        ajaxType: "get",
        //url地址
        url: null,
        //解析数据长度
        count:"totalCount",
        //解析数据列表
        data:"data",
        //开启分页
        page: true,
        //分页标识
        pageName: 'pageNo',
        //limit标识
        limitName: 'pageSize'
    },
    //元素
    element: null,
    //是否显示间隔斑马纹
    stripe: true,
    //是否带有纵向边框
    border: true,
    //表格宽度，单位 px
    width: null,
    //表格是否加载中
    loading: false,
    //禁用鼠标悬停时的高亮
    disabledHover: false,
    //数据为空时显示的提示内容
    noDataText: null,
    //内容类型头信息
    contentType:false
};
MonsterDataGrid.foundation = {
    //表格列的配置描述
    cols: {
        //列头显示文字
        title: null,
        //对应列内容的字段名
        key: null,
        //列宽
        width: null,
        //最小列宽
        minWidth: null,
        //最大列宽
        maxWidth: null,
        //对齐方式，可选值为 left 左对齐、right 右对齐和 center 居中对齐
        align: "left",
        //开启后，文本将不换行，超出部分显示为省略号
        ellipsis: false,
        //自定义渲染列
        render: null,
        //自定义列头显示内容
        renderHeader: null,
        //对应列的类型。如果设置了 selection 则显示多选框；如果设置了 index 则显示该行的索引（从 1 开始计算）；如果设置了 expand 则显示为一个可展开的按钮
        columnType: null,
        //如果设置了 type=index，可以通过传递 index 属性来自定义索引
        index: null
    },
    dataType:"json",
    success:"success",
    table: function (className) {
        return '<table class="'+className+'-table '+className+'-table-bordered" cellspacing="0">';
    }
};
MonsterDataGrid.prototype = {
    Construct: MonsterDataGrid,
    //初始化方法
    init: function (config) {
        this.config = $.extend(true, {}, MonsterDataGrid.config, config);
        this.request()
    },
    //渲染表格
    render: function () {

    },
    //构建html
    builder:function(){

    },
    //请求数据
    request: function () {
        if (!this.config.url) {
            throw Error("url error...")
        }
        $.ajax({
            url:this.config.url,
            type:this.config.ajaxType,
            dataType:MonsterDataGrid.foundation.dataType
        }).then(this.requestSuccess);
    },
    requestSuccess:function(data,result){
        if(result===MonsterDataGrid.foundation.success){

        }
    },
    //重载数据
    reload: function () {

    },
    //遍历
    each: function () {
        if (this.config.columns.length < 1) {
            throw Error("columns error");
        }
        let that = this;
        this.config.columns.forEach(function (val, key) {

        });
        console.log(that.config.columns)
    },
    //分页
    pagination: function () {

    }
};
