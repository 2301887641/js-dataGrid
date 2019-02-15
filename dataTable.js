;(function (w, pageUi, loadUi,lay) {
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
        //表格列的配置描述 有几个不存在的属性field要和返回的数据列对应的字段属性,customColumn自定义列渲染,ordinal自定义列渲染排序
        cols: {
            //列头显示文字
            title: "无",
            //列宽
            width: 0,
            //对齐方式，可选值为 left 左对齐、right 右对齐和 center 居中对齐
            align: "left",
            //开启后，文本将不换行，超出部分显示为省略号
            ellipsis: false,
            //自定义渲染列
            render: $.noop,
            //自定义列头显示内容
            renderHeader: $.noop,
            //对应列的类型。如果设置了 selection 则显示多选框；如果设置了 index 则显示该行的索引（从 1 开始计算）；如果设置了 expand 则显示为一个可展开的按钮
            columnType: $.noop,
            //可以排序
            sort: false
        },
        //ajax
        success: "success",
        //请求类型
        dataType: "json",
        //奇数class
        odd: "odd",
        //偶数class
        even: "even",
        //排序class
        sortClass: "-th-sorting",
        //自定义列名称记录
        customField: "_Monster_dataTable_",
        //编辑
        customEditColumnString:"编辑",
        //删除
        customDelColumnString:"删除",
        //自定义 编辑和删除列
        customColumnRender: function () {
            return {
                cell: $("<div class='" + this.config.className + "-table-td-customCell'>"),
                edit: $('<button class="' + this.config.className + '-table-td-customBtn '+this.config.className+'-table-td-primaryBtn">'+MonsterDataGrid.foundation.customEditColumnString+'</button>'),
                del: $('<button class="' + this.config.className + '-table-td-customBtn '+this.config.className+'-table-td-delBtn">'+MonsterDataGrid.foundation.customDelColumnString+'</button>')
            }
        },
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
            let th = $('<th>'), cell = $("<div class='" + this.config.className + "-table-th-cell'>");
            arg[1]["sort"] && th.addClass(this.config.className + MonsterDataGrid.foundation.sortClass);
            cell.html(arg[1].title);
            th.append(cell);
            return {th, cell};
        },
        //表格的td
        td: function (arg) {
            let td = $("<td>"), cell = $("<div class='" + this.config.className + "-table-td-cell'>");
            cell.html(!!arg[1] ? arg[1] : "");
            td.append(cell);
            return {td, cell};
        },
        //匹配百分比正则
        percent: /\d+%$/,
        //发布订阅模式
        observer: {
            //缓存列表
            clientList: [],
            //订阅函数
            listen: function (key, fn) {
                if (!this.clientList[key])
                    this.clientList[key] = [];
                this.clientList[key].push(fn);
            },
            //发布函数
            trigger: function () {
                let key = Array.prototype.shift.call(arguments);
                let fns = this.clientList[key];
                if (!fns || fns.length === 0)
                    return false;
                for (let i = 0, fn; fn = fns[i++];) {
                    fn.apply(this, arguments);
                }
            },
            //删除函数
            remove: function (key, fn) {
                let fns = this.clientList[key];
                if (!fns || fns.length === 0)
                    return false;
                if (!fn) {
                    fns && (fns.length = 0);
                } else {
                    for (let i = fns.length - 1; i >= 0; i--) {
                        let _fn = fns[i];
                        if (_fn === fn) {
                            fns.splice(i, 1);
                        }
                    }
                }
            }
        },
        //存放自定义按钮事件
        btnEvent:[],
        //自定义按钮事件名称
        btnEventName:"monster_custom_btn"
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
                    columnCount: 0,
                },
                //宽度相关
                width: {
                    //table的宽度
                    tableWidth: null,
                    //所有列总宽度和
                    countWidth: 0,
                    //自动列分配的宽度
                    autoWidth: 0,
                    //th单元格的总宽度
                    thCellCountWidth: 0,
                    //tr单元格的总宽度
                    tdCellCountWidth: 0
                },
                //分页
                page: null,
                //自定义列
                customColumn: null
            };
            // this.load = null;
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
            //表格内容容器
            this.monster.dataGrid.boxContainer = $(this.proxy(MonsterDataGrid.foundation.box));
            //表格分页容器
            this.monster.dataGrid.pageContainer = $(this.proxy(MonsterDataGrid.foundation.page));

            //----------------------插入容器------------------
            //插入内容容器
            this.monster.dataGrid.dataGridContainer.append(this.monster.dataGrid.boxContainer);
            //插入分页容器
            this.monster.dataGrid.dataGridContainer.append(this.monster.dataGrid.pageContainer);

            //------------------构建表头 表格html-------------------
            //构建表头 行html
            this.monster.dataGrid.headerTableBodyTrElement = MonsterDataGrid.foundation.tr();

            //---------------------遍历表头-----------------------
            //-----------构建表格内容html-------------
            this.monster.dataGrid.boxTableElement = $(this.proxy(MonsterDataGrid.foundation.table));
            //构建表格主体
            this.monster.dataGrid.boxTableBodyElement = MonsterDataGrid.foundation.tableBody();

            //------------插入表格内容------------------
            this.monster.dataGrid.boxTableElement.append(this.monster.dataGrid.boxTableBodyElement);
            this.monster.dataGrid.boxContainer.append(this.monster.dataGrid.boxTableElement);

            //提前放入
            $(this.config.element).append(this.monster.dataGrid.dataGridContainer);
            //遍历表头
            this.columnEach();
            //窗口改变
            this.resize();
        },
        //渲染表格
        render: function () {
            //暂时关闭loading层
            // this.load.remove();
            //分页
            this.pagination();
        },
        //绑定事件
        on: function (type, handler) {
            let that = this;
            MonsterDataGrid.foundation.observer.listen(type, function (arg) {
                handler(arg);
            });
            return this;
        },
        //自定义按钮点击绑定
        btnBind:function(callback){
            callback(this);
            return this;
        },
        //自动列渲染
        autoColumnRender: function (obj,data) {
            let render = this.proxy(MonsterDataGrid.foundation.customColumnRender);
            for (let i = 0; i < obj.length; i++) {
                MonsterDataGrid.foundation.btnEvent[i] = MonsterDataGrid.foundation.btnEventName + i;
                if (obj[i].editColumn) {
                    render.edit.click(function(){
                        obj[i].editColumn.url &&
                        lay({
                            title:MonsterDataGrid.foundation.customEditColumnString,
                            content:obj[i].editColumn.url,
                            area:["1024px","800px"]
                        }).on(lay.foundation.btnEvent[0],function(that){
                            MonsterDataGrid.foundation.observer.trigger(MonsterDataGrid.foundation.btnEvent[i],that.getFrame());
                        });
                    });
                    render.cell.append(render.edit);
                    continue;
                }
                if (obj[i].delColumn) {
                    render.del.click(function(){
                        MonsterDataGrid.foundation.observer.trigger(MonsterDataGrid.foundation.btnEvent[i])
                    });
                    render.cell.append(render.del);
                    continue;
                }
                if(obj[i].customColumn){
                    if(typeof obj[i].customColumn ==="function"){
                        let customBtn=$(obj[i].customColumn());
                        customBtn.click(function(){
                            MonsterDataGrid.foundation.observer.trigger(MonsterDataGrid.foundation.btnEvent[i],data)
                        });
                        render.cell.append(customBtn)
                    }
                }
            }
            return render.cell;
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
            // if (!this.load) {
            //     this.load = loadUi({element: this.config.element});
            // }
            // this.load.build();
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
                async:false,
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
            this.data = this.parseNestedSymbol(data, this.config.request.data);
            if (!this.data) {
                throw new Error("parse data error...");
            }
            this.each();
        },
        //循环字段 计算宽度
        columnEach: function () {
            this.monster.width.tableWidth = this.parentWidth();
            //遍历字段
            for (let i = 0, that = this, width = null, obj = null; i < this.config.columns.length; i++) {
                obj = $.extend({}, MonsterDataGrid.foundation.cols, this.config.columns[i]);
                width = obj.width;
                if (!obj.hasOwnProperty("field") && !obj.hasOwnProperty("customField")) {
                    break;
                }
                //如果自定义了宽度 百分比
                if (MonsterDataGrid.foundation.percent.test(width)) {
                    width = Math.floor((parseFloat(width) / 100) * this.monster.width.tableWidth);
                    width < this.config.cellMinWidth && (width = this.config.cellMinWidth);
                } else if (width === 0) {
                    this.monster.column.autoColNums++;
                }
                this.monster.width.countWidth += width;
                let thObj = this.proxy(MonsterDataGrid.foundation.th, obj);
                this.monster.column.columnCount++;
                this.monster.dataGrid.headerTableBodyTrElement.append(thObj.th);
                //如果配置了field字段
                if (obj.hasOwnProperty("field") && (!obj.hasOwnProperty("customField"))) {
                    this.fieldMapping[obj.field] = {
                        ordinal: i + 1,
                        field: obj,
                        origin: thObj.cell,
                        tr: this.monster.dataGrid.headerTableBodyTrElement
                    }
                } else if (!obj.hasOwnProperty("field") && (obj.hasOwnProperty("customField"))) {
                    if (!obj.column instanceof Array) {
                        break;
                    }
                    this.monster.customColumn = obj.column;
                    this.fieldMapping[MonsterDataGrid.foundation.customField] = {
                        ordinal: i + 1,
                        field: obj,
                        origin: thObj.cell,
                        tr: this.monster.dataGrid.headerTableBodyTrElement
                    }
                }
            }
        },
        //设置列宽
        setColsWidth: function (obj, t) {
            this.computedWidth(obj, t.cell, "td");
            return t.td;
        },
        //设置表头列宽
        setColumnWidth: function (obj) {
            this.computedWidth(obj, obj.origin, "th")
        },
        //最后一列的宽度
        lastColumnWidth(target, cellCountWidth) {
            //2像素的表格边框
            target.width((this.monster.width.tableWidth - cellCountWidth - (this.config.columns.length - 1) > 0) ? this.monster.width.tableWidth - cellCountWidth - (this.config.columns.length - 1) - 2 : this.config.cellMinWidth);
        },
        //计算表头和列的宽度
        computedWidth(obj, target, type) {
            //给未分配宽的列平均分配宽
            if (obj.field.width === 0) {
                target.width(Math.floor(this.monster.width.autoWidth >= this.config.cellMinWidth ? this.monster.width.autoWidth : this.config.cellMinWidth));
            } else if (MonsterDataGrid.foundation.percent.test(obj.field.width)) {
                //给设定百分比的列分配列宽 防止多次调用
                target.width(Math.floor((parseFloat(obj.field.width) / 100) * this.monster.width.tableWidth));
            } else {
                target.width(obj.field.width);
            }
            if (obj.ordinal === this.config.columns.length) {
                if (type === "th") {
                    this.lastColumnWidth(target, this.monster.width.thCellCountWidth);
                    this.monster.width.thCellCountWidth = 0;
                } else {
                    this.lastColumnWidth(target, this.monster.width.tdCellCountWidth);
                    this.monster.width.tdCellCountWidth = 0;
                }
            } else {
                if (type === "th") {
                    this.monster.width.thCellCountWidth += target.width();
                } else {
                    this.monster.width.tdCellCountWidth += target.width();
                }
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
            this.monster.dataGrid.boxTableBodyElement.empty();
            //计算宽度
            (this.monster.width.tableWidth > this.monster.width.countWidth && this.monster.column.autoColNums) && (
                this.monster.width.autoWidth = (this.monster.width.tableWidth - this.monster.width.countWidth) / this.monster.column.autoColNums);
            for (let i in this.data) {
                if (this.data[i] instanceof Object) {
                    tr = (num % 2 !== 0) ? MonsterDataGrid.foundation.tr(MonsterDataGrid.foundation.odd) : MonsterDataGrid.foundation.tr(MonsterDataGrid.foundation.even);
                    for (let j in this.fieldMapping) {
                        //如果存在field字段的话
                        if (this.fieldMapping[j]["field"]) {
                            this.setColumnWidth(this.fieldMapping[j]);
                        }
                        if (j !== MonsterDataGrid.foundation.customField) {
                            tr.append(this.setColsWidth(this.fieldMapping[j], this.proxy(MonsterDataGrid.foundation.td, this.data[i][j])));
                        } else if (j === MonsterDataGrid.foundation.customField && this.monster.customColumn) {
                            tr.append(this.setColsWidth(this.fieldMapping[j], this.proxy(MonsterDataGrid.foundation.td, this.autoColumnRender(this.monster.customColumn,this.data[i]))));
                        }
                        this.monster.dataGrid.boxTableBodyElement.append(tr);
                    }
                }
                num++;
            }
            //需要等待设置完表头宽度后,才能插入表头 否则宽度会失效
            this.monster.dataGrid.boxTableBodyElement.prepend(this.monster.dataGrid.headerTableBodyTrElement);
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
        throttle: function (method, context) {
            clearTimeout(method.tId);
            method.tId = setTimeout(function () {
                method.call(context);
            }, 300);
        },
        resizeFunc: function () {
            this.monster.width.tableWidth = this.parentWidth();
            this.each();
        },
        resize: function () {
            let that = this;
            $(w).on("resize", function () {
                that.throttle(that.resizeFunc, that)
            });
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
                this.monster.page = pageUi({
                    element: this.monster.dataGrid.pageContainer,
                    total: pageTotal,
                }).on(pageUi.event.currentChange, function (page) {
                    that.request(page)
                });
            }
        }
    };
    MonsterDataGrid.prototype.init.prototype = MonsterDataGrid.prototype;
    if (!w.MonsterDataGrid) {
        w.monsterDataGrid = MonsterDataGrid;
    }
})(window, monsterPagination, monsterLoading,layering);
