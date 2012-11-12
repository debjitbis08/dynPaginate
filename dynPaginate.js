/**
 * jQuery pagination plugin
 * Author: @debjitbis08
 * Licensed under the MIT license
 */
(function ($, window, document, undefined) {

    /**
     * This creates a pagination structure which is not tied to the content.
     * For details please see: http://debjitbiswas.com/entry/jquery-pagination-plugin/
     *
     * @class Paginate
     * @constructor
     * @param elem {Object} DOM Element
     * @param options {Object} Configuration Object
     */
    var Paginate = function (elem, options) {
        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;
        this.current = 1;
    };

    Paginate.prototype = {

        /**
         * The default options.
         *
         * @property defaults
         * @type Object
         */
        defaults: {
            count: 0,
            adj: 10,
            edgeCount: 2,
            prevText: "Prev",
            nextText: "Next",
            onChange: function () {}
        },

        /**
         * Initialize the plugin.
         *
         * @method init
         * @chainable
         */
        init: function () {

            var self = this;

            self.config = $.extend({}, this.defaults, this.options);

            if (typeof self.config.onChange  !== 'function') { throw new Error("onChange must be a function"); }
            if (typeof self.config.count     !== 'number')   { throw new Error("count must be a number"); }
            if (typeof self.config.adj       !== 'number')   { throw new Error("adj must be a number"); }
            if (typeof self.config.edgeCount !== 'number')   { throw new Error("edgeCount must be a number"); }

            if (self.config.count === 0) {
              return self;
            }

            self._buildDOM().appendTo(self.$elem);

            if ((2*self.config.adj + 1) + (2*self.config.edgeCount) > self.config.count) {
                /* No need to do dynamic pagination. The number list will be static. */
                self._initStaticPagination();
            }
            else {
                self._initDynamicPagination();
            }

            self.$elem.find('a').click(function (e) {
                self.setPage(parseInt($(this).attr('href').match(/#page_(\d+)/)[1], 10));
                
                self.config.onChange(self.current);
                e.preventDefault();
            });

            return self;
        },

        /**
         * Build the HTML.
         *
         * @method _buildDOM
         * @private
         * @return {String} The HTML string.
         */
        _buildDOM: function () {

            var html = [], self = this;

            html.push('<ol>');
            html.push('<li class="prev">' + self.config.prevText + '</li>');
            for (i = 0; i < self.config.count; i++) {
                html.push('<li><a href="#page_'+ (i+1) +'">' + (i + 1) + '</a></li>');
            }
            html.push('<li class="next">' + self.config.nextText + '</li>');
            html.push('</ol>');
            html = $(html.join(''));

            return html;
        },

        /**
         * Initialize the plugin with only static list of page number and no prev next buttons.
         *
         * @method _initStaticPagination
         * @private
         */
        _initStaticPagination: function () {

            var self = this;

            self.$elem.find('li.prev,li.next').remove();
        },

        /**
         * Initialize the plugin for large number of pages.
         *
         * @method _initDynamicPagination
         * @private
         */
        _initDynamicPagination: function () {

            var self = this;

            self.$elem.find('li:eq(1)').addClass('active');
            self.$elem.find('li:not(".prev"):not(".next")').eq(self.config.edgeCount - 1).after('<li class="ellipsis first">...</li>');
            self.$elem.find('li:not(".ellipsis"):not(".prev"):not(".next")').eq(self.config.count - self.config.edgeCount).before('<li class="ellipsis last">...</li>');
            self.$elem.find('li:not(".ellipsis"):not(".prev"):not(".next")').slice(self.config.adj+1, self.config.count-self.config.edgeCount).hide();
            self.$elem.find('li.ellipsis.first').hide();
            self.$elem.find('li.prev').hide();


            self.$elem.find('li.prev,li.next').click(function (e) {

                var current = self.current + ($(this).hasClass('prev') ? -1 : 1);

                self.setPage(current);

                self.config.onChange(self.current);
                e.preventDefault();
            });
        },

        /**
         * Set the page number.
         *
         * @method setPage
         * @param current {Number} Page number
         */
        setPage: function (current) {

            var self = this;

            self.$elem.find('li').removeClass('active');
            self.$elem.find('li a[href="#page_'+ current +'"]').parent('li').addClass('active');

            this.current = current;
            self._adjustNumberDisplay();
            return current;
        },

        /**
         * Adjust the display of page numbers.
         *
         * @method _adjustNumberDisplay
         * @private
         */
        _adjustNumberDisplay: function () {

            var el = this.$elem,
                adj = this.config.adj,
                count = this.config.count,
                edgeCount = this.config.edgeCount,
                current = this.current,
                numbers = this.$elem.find('li:not(".ellipsis"):not(".prev"):not(".next")');

            /* Near the start */
            if (current < adj + 1) {
              numbers.show();
              numbers.slice(adj+1, count-edgeCount).hide();
            }
            else if (current >= adj + 1 && current <= count - edgeCount) {
              /* Somewhere in the middle */
              numbers.hide();
              numbers.slice(0, edgeCount).show();
              numbers.slice(count - edgeCount, count).show();
              numbers.slice(current - adj - 1, current + adj).show();
            }
            else if (current > count - edgeCount) {
              numbers.show();
              numbers.slice(edgeCount, current - adj).hide();
            }

            /* Show/Hide ellipses */
            if (current + adj + 1 <= count - edgeCount) { el.find('li.ellipsis.last').show(); }
            else { el.find('li.ellipsis.last').hide(); }

            if (current - adj <= edgeCount + 1) { el.find('li.ellipsis.first').hide(); }
            else { el.find('li.ellipsis.first').show(); }

            /* Show/Hide Previous and Next links */
            if (current === 1) { el.find('li.prev').hide(); }
            else { el.find('li.prev').show(); }

            if (current === count) { el.find('li.next').hide(); }
            else { el.find('li.next').show(); }
        }
    };

    $.fn.dynPaginate = function(options) {
        return this.each(function() {
            new Paginate(this, options).init();
        });
    };

})(jQuery, window, document);