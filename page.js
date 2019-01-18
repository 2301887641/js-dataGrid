;(function (w) {
    function Pagination(config) {
        return new Pagination.prototype.init(config);
    }

    Pagination.config = {
        //元素
        element: "body",
        //当前页
        current: 1,
        //总记录数
        total: 1,
        //每页显示的数量
        pageSize: 10,
        //class类名
        className: "monster",
        //前面5页
        prePageNumber: 5,
        //后面4页
        backPageNumber: 4
    };
// 事件
    Pagination.event = {
        currentChange: "current-change"
    };
    Pagination.foundation = {
        pagination: function (className) {
            return '<div class="' + className + '-page">';
        },
        container: function (className) {
            return '<ul class="' + className + '-page-container">';
        },
        index: function (className) {
            return '<li class="' + className + '-page-item ' + className + '-page-button"><a class="' + className + '-page-link">首页</a></li>'
        },
        previous: function (className) {
            return '<li class="' + className + '-page-item ' + className + '-page-button ' + className + '-page-previous"><a class="' + className + '-page-link">上一页</a></li>'
        },
        next: function (className) {
            return '<li class="' + className + '-page-item ' + className + '-page-button"><a class="' + className + '-page-link">下一页</a></li>'
        },
        tail: function (className) {
            return '<li class="' + className + '-page-item ' + className + '-page-button"><a class="' + className + '-page-link">尾页</a></li>';
        },
        item: function (number, className) {
            return '<li class="' + className + '-page-item"><a class="' + className + '-page-link">' + number + '</a></li>';
        },
        current: function (number, className) {
            return '<li class="' + className + '-page-item ' + className + '-pager-current-page"><a class="' + className + '-page-link">' + number + '</a></li>';
        },
        itemClass: function (className) {
            return className + '-page-item';
        },
        currentClass: function (className) {
            return className + '-pager-current-page';
        },
        disableClass: function (className) {
            return className + '-page-disabled';
        },
        pageSizeArr: [10, 20, 30, 40],
        //最大移动上限
        maxMove: 10,
        //最小当前页
        minCurrentPageNumber: 1,
    };
    Pagination.prototype = {
        construct: Pagination,
        instance: function () {
            this.init();
            return this;
        },
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
        //初始化
        init: function (config) {
            this.map = {};
            this.config = $.extend({}, Pagination.config, config);
            if (Pagination.foundation.pageSizeArr.indexOf(this.config.pageSize) === -1) {
                this.config.pageSize = Pagination.foundation.pageSizeArr[0];
            }
            //计算一共多少页
            this.map.pageNumber = Math.ceil(this.config.total / this.config.pageSize);
            //开始页数
            this.map.start = this.config.current;
            //结束页数
            this.map.end = (this.map.pageNumber < Pagination.foundation.maxMove) ? this.map.pageNumber : Pagination.foundation.maxMove;
            this.build();
        },
        //构建
        build: function () {
            let that = this;
            this.map.page = $(Pagination.foundation.pagination(this.config.className));
            this.map.container = $(Pagination.foundation.container(this.config.className));
            //首页
            this.map.index = $(Pagination.foundation.index(this.config.className)).click(function () {
                if (that.map.currentPage > Pagination.foundation.minCurrentPageNumber) {
                    that.observer.trigger(Pagination.event.currentChange, Pagination.foundation.minCurrentPageNumber);
                    that.map.start = that.config.current = Pagination.foundation.minCurrentPageNumber;
                    that.map.end = (that.map.pageNumber < Pagination.foundation.maxMove) ? that.map.pageNumber : Pagination.foundation.maxMove;
                    that.map.page.remove();
                    that.build();
                }
            });
            //上一页
            this.map.previous = $(Pagination.foundation.previous(this.config.className)).click(function () {
                if (that.map.currentPage > Pagination.foundation.minCurrentPageNumber) {
                    that.map.currentElement.prev().click()
                }
            });
            //下一页
            this.map.next = $(Pagination.foundation.next(this.config.className)).click(function () {
                if (that.map.currentPage < that.map.pageNumber) {
                    that.map.currentElement.next().click()
                }
            });
            //尾页
            this.map.tail = $(Pagination.foundation.tail(this.config.className)).click(function () {
                if (that.map.currentPage < that.map.pageNumber) {
                    that.observer.trigger(Pagination.event.currentChange, that.map.pageNumber);
                    that.map.end = that.config.current = that.map.pageNumber;
                    that.map.start = (that.map.pageNumber - Pagination.foundation.maxMove + Pagination.foundation.minCurrentPageNumber) > 0 ? that.map.pageNumber - Pagination.foundation.maxMove + Pagination.foundation.minCurrentPageNumber : Pagination.foundation.minCurrentPageNumber;
                    that.map.page.remove();
                    that.build();
                }
            });
            //上一页和首页
            if (this.config.current === Pagination.foundation.minCurrentPageNumber) {
                this.map.index.addClass(Pagination.foundation.disableClass(this.config.className));
                this.map.previous.addClass(Pagination.foundation.disableClass(this.config.className));
                this.map.container.append(this.map.index).append(this.map.previous);
            } else {
                this.map.container.append(this.map.index).append(this.map.previous);
            }
            this.pageNumber();
            if (this.config.current === this.map.pageNumber) {
                this.map.next.addClass(Pagination.foundation.disableClass(this.config.className));
                this.map.tail.addClass(Pagination.foundation.disableClass(this.config.className));
                this.map.container.append(this.map.next).append(this.map.tail);
            } else {
                this.map.container.append(this.map.next).append(this.map.tail);
            }
            this.map.page.append(this.map.container);
            $(this.config.element).append(this.map.page);
        },
        pageNumber: function () {
            if (Number.parseInt(this.config.total) < Pagination.foundation.minCurrentPageNumber) {
                throw new Error("total number error.....")
            }
            this.map.currentPage = this.config.current;
            //前5后4 大于9 需要移动
            for (let i = this.map.start; i <= this.map.end; i++) {
                //当前页
                if (this.config.current === i) {
                    this.map.currentElement = this.event($(Pagination.foundation.current(i, this.config.className)), i);
                    this.map.container.append(this.map.currentElement);
                    continue;
                }
                this.map.container.append(this.event($(Pagination.foundation.item(i, this.config.className)), i));
            }
        },
        //绑定事件
        on: function (type, handler) {
            let that = this;
            this.observer.listen(type, function (currentPage) {
                handler(currentPage);
            });
            return this;
        },
        //事件
        event: function (element, page) {
            let that = this;
            element.click(function () {
                if (!element.hasClass(Pagination.foundation.currentClass(that.config.className))) {
                    that.observer.trigger(Pagination.event.currentChange, page);
                    that.map.currentElement.removeClass(Pagination.foundation.currentClass(that.config.className));
                    that.map.currentElement = $(this).toggleClass(Pagination.foundation.currentClass(that.config.className));
                    that.map.currentPage = page;
                    that.movePage();
                }
            });
            return element;
        },
        movePage: function () {
            //页码大于9个
            if ((this.map.pageNumber - this.map.start) >= (Pagination.foundation.maxMove - Pagination.foundation.minCurrentPageNumber)) {
                //当前页码后面有5个以上的页码
                if (this.map.currentPage - this.map.start >= this.config.prePageNumber) {
                    //当前页码加上4个大于总页码数
                    if ((this.map.currentPage + this.config.backPageNumber) >= this.map.pageNumber) {
                        this.map.end = this.map.pageNumber;
                        this.map.start = this.map.end - (Pagination.foundation.maxMove - Pagination.foundation.minCurrentPageNumber);
                    } else {
                        this.map.end = this.map.currentPage + this.config.backPageNumber;
                        this.map.start = this.map.currentPage - this.config.prePageNumber;
                    }
                } else {
                    if ((this.map.currentPage - this.config.prePageNumber) >= Pagination.foundation.minCurrentPageNumber) {
                        this.map.start = this.map.currentPage - this.config.prePageNumber;
                        this.map.end = this.map.start + (Pagination.foundation.maxMove - Pagination.foundation.minCurrentPageNumber);
                    } else {
                        this.map.start = Pagination.foundation.minCurrentPageNumber;
                        this.map.end = this.map.start + (Pagination.foundation.maxMove - Pagination.foundation.minCurrentPageNumber);
                    }
                }

            }
            //重置当前页
            this.config.current = this.map.currentPage;
            this.map.page.remove();
            this.build();
        }
    };
    Pagination.prototype.init.prototype = Pagination.prototype;
    if (!w.monsterPagination) {
        w.monsterPagination = Pagination;
    }
})(window);
