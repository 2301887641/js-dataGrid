;(function (w) {
    function Loading(config) {
        return new Loading.prototype.init(config);
    }

    Loading.config = {
        //元素
        element: "body",
        //文本
        text: "",
        //icon
        icon: "&#xe81c;",
        //类名
        className: "monster",
        //字体大小
        fontSize: 50
    };
    Loading.foundation = {
        loading: function () {
            return '<div class="' + this.config.className + '-loading">';
        },
        wrapper: function () {
            return '<div class="' + this.config.className + '-loading-wrapper">'
        },
        icon: function () {
            return '<i class="' + this.config.className + '-loading-icon">' + this.config.icon + '</i>';
        },
        text: function () {
            return '<div class="' + this.config.className + '-loading-text">' + this.config.text + '</div>';
        }
    };
    Loading.prototype = {
        constructor: Loading,
        proxy: function (func) {
            let that = this;
            return (function () {
                return func.apply(that, arguments);
            })()
        },
        init: function (config) {
            this.config = $.extend({}, Loading.config, config);
            this.loading = null;
            return this;
        },
        build: function () {
            if (!this.loading) {
                this.loading = $(this.proxy(Loading.foundation.loading)).css("fontSize", this.config.fontSize);
                this.loading.append($(this.proxy(Loading.foundation.wrapper)).append($(this.proxy(Loading.foundation.icon))).append($(this.proxy(Loading.foundation.text))));
                $(this.config.element).css("position", "relative").append(this.loading);
            }
        },
        remove: function () {
            if (this.loading) {
                this.loading.remove();
                this.loading=null;
            }
        }
    };
    Loading.prototype.init.prototype = Loading.prototype;
    w.monsterLoading = Loading;
})(window);
