function MonsterDataGrid(config) {
    this.init(config);
    return this;
}

MonsterDataGrid.config = {
    //设定容器唯一 id。id 是对表格的数据操作方法上是传递条件，它是表格容器的索引
    id: null,
    //表格列数组
    columns: [],
    //ajax类型
    type: "get",
    //url地址
    url: null,
    //嵌套字符
    nestedSymbol: ".",
    //配置请求
    request: {
        //解析数据长度
        count: "totalCount",
        //解析数据列表
        data: "data",
        //开启分页
        page: true,
        //分页标识
        pageName: 'pageNo',
        //limit标识
        limitName: 'pageSize'
    },
    //元素
    element: "body",
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
    contentType: false,
    //默认class前缀
    className: "monster"
};
MonsterDataGrid.foundation = {
    //表格列的配置描述
    cols: {
        //列头显示文字
        title: "无",
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
        index: null,
        //可以排序
        sort: false
    },
    //请求类型
    dataType: "json",
    //成功回执
    success: "success",
    //奇数class
    odd:"odd",
    //偶数class
    even:"even",
    //类型
    type: {
        get: "get",
        post: "post",
        delete: "delete",
        put: "put",
    },
    //构建表格
    table: function (className) {
        return '<table class="' + className + '-table ' + className + '-table-bordered" cellspacing="0">';
    },
    //表格头部
    tableHead: function (th) {
        return "<thead><tr>" + th + "</tr></thead>";
    },
    //表格的th
    th: function (name, className) {
        return !!className ? '<th class="sorting">' + name + '</th>' : '<th>' + name + '</th>';
    },
    //表格的tbody
    tableBody: function (content) {
        return "<tbody>" + content + "</tbody></table>";
    },
    //表格的tr
    tr: function (order) {
        return '<tr class="' + order + '">';
    },
    //表格的td
    td: function (title) {
        return '<td>' + title + '</td>'
    }
};
MonsterDataGrid.prototype = {
    Construct: MonsterDataGrid,
    //初始化方法
    init: function (config) {
        this.columns = [];
        this.config = $.extend(true, {}, MonsterDataGrid.config, config);
        this.request();
    },
    //渲染表格
    render: function (text) {
        let table = MonsterDataGrid.foundation.table(this.config.className), head = "";
        this.columnEach((v, k) => {
            head += MonsterDataGrid.foundation.th(v.title, !!v.sort ? v.sort : false)
        });
        $(this.config.element).append($(table+MonsterDataGrid.foundation.tableHead(head)+MonsterDataGrid.foundation.tableBody(text)))
    },
    //统一构建
    framework: (function () {
        return {
            //ajax请求类型
            type: function (name) {
                return !!MonsterDataGrid.foundation.type[name] ? MonsterDataGrid.foundation.type[name] : MonsterDataGrid.foundation.type.get;
            }
        }
    })(),
    //请求数据
    request: function () {
        if (!this.config.url) {
            throw new Error("url error...");
        }
        let that = this;
        $.ajax({
            url: this.config.url,
            type: this.framework.type(this.config.type),
            dataType: MonsterDataGrid.foundation.dataType
        }).then(function (data, result) {
            if (result !== MonsterDataGrid.foundation.success) {
                throw new Error("ajax request failed......");
            }
            that.parseData(data);
        });
    },
    //解析数据
    parseData(data) {
        this.data = data[this.config.request.data] ? data[this.config.request.data] : null;
        if (!this.data) {
            throw new Error("parse data error...");
        }
        this.each();
    },
    //循环字段
    columnEach: function (func) {
        let arr = (this.columns.length < 1) ? this.config.columns : this.columns;
        //遍历字段
        arr.forEach((v, k) => {
            let obj =v;
            if(this.columns.length !== this.config.columns.length){
                obj=$.extend({}, MonsterDataGrid.foundation.cols, v);
                this.columns.push(obj);
            }
            func instanceof Function && func(obj, k)
        })
    },
    //重载数据
    reload: function () {

    },
    //遍历
    each: function () {
        if (this.config.columns.length < 1 || !Array.isArray(this.config.columns)) {
            throw new Error("columns error....");
        }
        if (!Array.isArray(this.data)) {
            throw new Error("data type not matching object...");
        }
        let str = "",num=0;
        for (let i in this.data) {
            str +=(num%2!==0)?MonsterDataGrid.foundation.tr(MonsterDataGrid.foundation.odd):MonsterDataGrid.foundation.tr(MonsterDataGrid.foundation.even);
            this.columnEach((v, k) => {
                str+=MonsterDataGrid.foundation.td(this.data[i][v.key])
            });
            num++;
        }
        str+=(str.length>0)?"</tr>":"";
        this.render(str);
    },
    //分页
    pagination: function () {

    }
};
