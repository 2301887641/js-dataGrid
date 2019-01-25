;(function (w, pageUi, loadUi) {
    function MonsterDataGrid(config) {
        return new MonsterDataGrid.prototype.init(config);
    }

    MonsterDataGrid.config = {
        //表格列数组
        columns: [],
        //ajax类型
        type: "get",
        //url地址
        url: null,
        //嵌套字符解析
        nestedSymbol: ".",
        //配置请求
        request: {
            //解析数据长度
            total: "pageTotal",
            //解析数据列表
            data: "data",
            //开启分页
            page: true,
            //分页标识
            pageName: 'pageNo',
            //limit标识
            limitName: 'pageSize',
            //分页数量
            pageSize: 10
        },
        //元素
        element: "body",
        //是否显示间隔斑马纹
        stripe: true,
        //表格宽度，单位 px
        width: null,
        //表格是否加载中
        loading: false,
        //数据为空时显示的提示内容
        noDataText: null,
        //默认class前缀
        className: "monster",
        //所有单元格默认最小宽度
        cellMinWidth: 60
    };
    MonsterDataGrid.foundation = {
        //表格列的配置描述
        cols: {
            //列头显示文字
            title: "无",
            //对应列内容的字段名
            field: "field",
            //列宽
            width: 0,
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
            //可以排序
            sort: false,
            //记录百分比
            percent: null,
        },
        //ajax
        success: "success",
        //请求类型
        dataType: "json",
        //奇数class
        odd: "odd",
        //偶数class
        even: "even",
        //类型
        type: {
            get: "get",
            post: "post",
            delete: "delete",
            put: "put",
        },
        sortClass: "-th-sorting",
        //数据表格容器
        dataGrid: function () {
            return '<div class="' + this.config.className + '-dataGrid">';
        },
        //工具栏
        tool: function () {
            return '<div class="' + this.config.className + '-dataGrid-tool">';
        },
        //工具栏内容
        toolInner: function () {
            return '<div class="' + this.config.className + '-dataGrid-toolInner">';
        },
        //数据内容区
        box: function () {
            return '<div class="' + this.config.className + '-dataGrid-box">';
        },
        //数据表头
        header: function () {
            return '<div class="' + this.config.className + '-dataGrid-box-header">';
        },
        //分页区域
        page: function () {
            return '<div class="' + this.config.className + '-dataGrid-page">';
        },
        //构建通用表格
        table: function () {
            return '<table class="' + this.config.className + '-table ' + this.config.className + '-table-bordered" cellspacing="0">';
        },
        //表格tbody
        tableBody: function () {
            return $("<tbody>");
        },
        //表格tr
        tr: function (className) {
            return !!className ? $('<tr>').addClass(className) : $('<tr>');
        },
        //表格th
        th: function (arg) {
            let th = $('<th>');
            arg[1]["sort"] && th.addClass(this.config.className + MonsterDataGrid.foundation.sortClass);
            return th.html(arg[1].title);
        },
        //表格的td
        td: function (obj, title) {
            return '<td>' + title + '</td>'
        },
        //匹配百分比正则
        percent: /\d+%$/
    };
    MonsterDataGrid.prototype = {
        construct: MonsterDataGrid,
        //初始化方法
        init: function (config) {
            this.config = $.extend(true, {}, MonsterDataGrid.config, config);
            //字段映射存储
            this.fieldMapping = {};
            //html构建信息存储
            this.monster = {
                //表格信息
                dataGrid: {},
                //列信息
                column: {
                    autoColNums: 0,
                    //记录列总数
                    columnCount: 0
                },
                //宽度相关
                width: {
                    //table的宽度
                    tableWidth: this.parentWidth(),
                    //所有列总宽度和
                    countWidth: 0,
                    //自动列分配的宽度
                    autoWidth: 0
                },
                page:null
            };
            this.load = null;
            this.beforeRequest();
            this.request();
        },
        //获取父元素宽度
        parentWidth: function () {
            let parent = $(this.config.element).parent(),
                width = parent.width(), hide;
            try {
                hide = parent.css('display') === 'none';
            } catch (e) {
            }
            if (parent.length > 0 && (!width || hide)) {
                return this.parentWidth(parent.parent());
            }
            return width;
        },
        //请求之前
        beforeRequest: function () {
            //------------------表格容器------------------
            this.monster.dataGrid.dataGridContainer = $(this.proxy(MonsterDataGrid.foundation.dataGrid));
            //表头容器
            this.monster.dataGrid.headerContainer = $(this.proxy(MonsterDataGrid.foundation.header));
            //表格内容容器
            this.monster.dataGrid.boxContainer = $(this.proxy(MonsterDataGrid.foundation.box));
            //表格分页容器
            this.monster.dataGrid.pageContainer = $(this.proxy(MonsterDataGrid.foundation.page));

            //----------------------插入表头容器------------------
            this.monster.dataGrid.dataGridContainer.append(this.monster.dataGrid.headerContainer);
            //插入内容容器
            this.monster.dataGrid.dataGridContainer.append(this.monster.dataGrid.boxContainer);
            //插入分页容器
            this.monster.dataGrid.dataGridContainer.append(this.monster.dataGrid.pageContainer);


            //------------------构建表头 表格html-------------------
            this.monster.dataGrid.headerTableElement = $(this.proxy(MonsterDataGrid.foundation.table));
            //构建表头 主体html
            this.monster.dataGrid.headerTableBodyElement = MonsterDataGrid.foundation.tableBody();
            //构建表头 行html
            this.monster.dataGrid.headerTableBodyTrElement = MonsterDataGrid.foundation.tr();

            //---------------------遍历表头-----------------------
            this.columnEach();

            //-------------------插入 表头 表格html---------------------
            this.monster.dataGrid.headerContainer.append(this.monster.dataGrid.headerTableElement);
            //插入 表头 主体html
            this.monster.dataGrid.headerTableElement.append(this.monster.dataGrid.headerTableBodyElement);
            //插入 表头 行html
            this.monster.dataGrid.headerTableBodyElement.append(this.monster.dataGrid.headerTableBodyTrElement);

            //-----------构建表格内容html-------------
            this.monster.dataGrid.boxTableElement = $(this.proxy(MonsterDataGrid.foundation.table));
            //构建表格主体
            this.monster.dataGrid.boxTableBodyElement = MonsterDataGrid.foundation.tableBody();

            //------------插入表格内容------------------
            this.monster.dataGrid.boxTableElement.append(this.monster.dataGrid.boxTableBodyElement);

            this.monster.dataGrid.boxContainer.append(this.monster.dataGrid.boxTableElement);
            //分页区域

        },
        //渲染表格
        render: function () {
            this.load.remove();
            $(this.config.element).append(this.monster.dataGrid.dataGridContainer);
            this.pagination();
        },
        //代理对象
        proxy: function (func) {
            let that = this;
            return (function (arg) {
                return func.call(that, arg);
            })(arguments);
        },
        //请求数据
        request: function (number = 1) {
            if (!this.config.url) {
                throw new Error("url error...");
            }
            if (!this.load) {
                this.load = loadUi({element: this.config.element});
            }
            this.load.build();
            let that = this, data = {},
                pageNameIndex = this.config.request.pageName.lastIndexOf(this.config.nestedSymbol),
                pageSizeIndex = this.config.request.limitName.lastIndexOf(this.config.nestedSymbol),
                pageSize = (pageSizeIndex !== -1) ? this.config.request.limitName.slice(pageSizeIndex + 1) : this.config.request.limitName,
                pageNo = (pageNameIndex !== -1) ? this.config.request.pageName.slice(pageNameIndex + 1) : this.config.request.pageName;
            data[pageNo] = number;
            data[pageSize] = Number.parseInt(this.config.request.pageSize);
            $.ajax({
                url: this.config.url,
                type: this.config.type,
                data: data,
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
            this.oldRequestData = data;
            this.data = this.parseNestedSymbol(data, this.config.request.data)
            if (!this.data) {
                throw new Error("parse data error...");
            }
            this.each();
        },
        //循环字段
        columnEach: function () {
            //遍历字段
            for (let i = 0, width = null, obj = null; i < this.config.columns.length; i++) {
                obj = $.extend({}, MonsterDataGrid.foundation.cols, this.config.columns[i]);
                width = obj.width;
                //如果自定义了宽度 百分比
                if (MonsterDataGrid.foundation.percent.test(width)) {
                    width = Math.floor((parseFloat(width) / 100) * this.monster.width.tableWidth);
                    width < this.config.cellMinWidth && (width = this.config.cellMinWidth);
                } else if (width === 0) {
                    this.monster.column.autoColNums++;
                }
                this.monster.width.countWidth += width;
                this.fieldMapping[obj.field] = {field: obj, origin: this.proxy(MonsterDataGrid.foundation.th, obj)};
                this.monster.column.columnCount++;
                this.monster.dataGrid.headerTableBodyTrElement.append(this.fieldMapping[obj.field].origin);
            }
            //计算宽度
            (this.monster.width.tableWidth > this.monster.width.countWidth && this.monster.column.autoColNums) && (
                this.monster.width.autoWidth = (this.monster.width.tableWidth - this.monster.width.countWidth) / this.monster.column.autoColNums);
        },
        //设置列宽
        setColsWidth: function (obj, t) {
            return $(t).width(obj.field.width);
        },
        //设置表头列宽
        setColumnWidth: function (obj) {
            //给位分配宽的列平均分配宽
            if (obj.field.width === 0) {
                obj.field.width = Math.floor(this.monster.width.autoWidth >= this.config.cellMinWidth ? this.monster.width.autoWidth : this.config.cellMinWidth);
                obj.origin.width(obj.field.width);
                //给设定百分比的列分配列宽 防止多次调用
            } else if (MonsterDataGrid.foundation.percent.test(obj.field.width) && !obj.field.percent) {
                obj.field.percent = obj.field.width;
                obj.field.width = Math.floor((parseFloat(obj.field.width) / 100) * this.monster.width.tableWidth);
                obj.origin.width(obj.field.width);
            }
        },
        //遍历
        each: function () {
            if (this.config.columns.length < 1 || !Array.isArray(this.config.columns)) {
                throw new Error("columns error....");
            }
            if (!(this.data instanceof Object)) {
                throw new Error("data type not matching object...");
            }
            let tr = "", num = 0;
            for (let i in this.data) {
                if (this.data[i] instanceof Object) {
                    tr = (num % 2 !== 0) ? MonsterDataGrid.foundation.tr(MonsterDataGrid.foundation.odd) : MonsterDataGrid.foundation.tr(MonsterDataGrid.foundation.even);
                    for (let j in this.fieldMapping) {
                        if (this.fieldMapping[j]["field"]) {
                            this.setColumnWidth(this.fieldMapping[j]);
                            tr.append(this.setColsWidth(this.fieldMapping[j], MonsterDataGrid.foundation.td(this.fieldMapping[j]["field"], this.data[i][j])));
                            this.monster.dataGrid.boxTableBodyElement.append(tr);
                        }
                    }
                }
                num++;
            }
            this.render();
        },
        //解析嵌套字符
        parseNestedSymbol: function (data, name) {
            if (name.indexOf(this.config.nestedSymbol) !== -1) {
                let arr = name.split(this.config.nestedSymbol), obj = data, value = "";
                while (arr.length > 0 && obj[arr[0]]) {
                    value = obj = obj[arr[0]];
                    arr.shift();
                }
                return value;
            }
            return data[name];
        },
        //分页
        pagination: function () {
            //开启分页
            if (this.config.request.page && !this.monster.page) {
                let that = this,
                    pageNumber = Number.parseInt(this.parseNestedSymbol(this.oldRequestData, this.config.request.pageName)),
                    pageTotal = Number.parseInt(this.parseNestedSymbol(this.oldRequestData, this.config.request.total));
                if (!pageNumber && !pageTotal) {
                    throw new Error("pagination error....");
                }
                this.monster.page = pageUi({element:  this.monster.dataGrid.pageContainer, total: pageTotal,}).on(pageUi.event.currentChange, function (page) {
                    that.request(page)
                });
            }
        }
    };
    MonsterDataGrid.prototype.init.prototype = MonsterDataGrid.prototype;
    if (!w.MonsterDataGrid) {
        w.monsterDataGrid = MonsterDataGrid;
    }
})(window, monsterPagination, monsterLoading);
