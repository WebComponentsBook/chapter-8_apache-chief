// Eh-neeek-chock
var ApacheChief = (function (global, $) {

    'use strict';

    // default resize handle css
    var handlesCss = {
        width: '10px',
        height: '10px',
        cursor: 'se-resize',
        position: 'absolute',
        display: 'none',
        'background-color': '#000'
    };

    // options defaults
    var defaults = {
        handles: ['BR'],
        handlesCss: {
            TM: $.extend({}, handlesCss, { cursor: 'n-resize', top: 0, left: '50%' }),
            TR: $.extend({}, handlesCss, { cursor: 'ne-resize', top: 0, right: 0 }),
            MR: $.extend({}, handlesCss, { cursor: 'e-resize', bottom: '50%', right: 0 }),
            BR: $.extend({}, handlesCss, { bottom: 0, right: 0 }),
            BM: $.extend({}, handlesCss, { cursor: 's-resize', bottom: 0, left: '50%' }),
            ML: $.extend({}, handlesCss, { cursor: 'w-resize', bottom: '50%', left: 0 }),
            BL: $.extend({}, handlesCss, { cursor: 'sw-resize', bottom: 0, left: 0 }),
            TL: $.extend({}, handlesCss, { cursor: 'nw-resize' }),
        }
    };

    // merge default CSS and developer defined CSS
    // this is necessary because $.extend is shallow
    function mergeResizeHandleCss(defaultCss, instanceCss) {
        var retVal = {};

        // iterate over default css properties
        for (var k in defaultCss) {
            // set return value poperty equal to the instance property defined
            // by the developer or the default css property value; it is also possible
            // to go down one more layer, but this assumes wholesale property
            // replacement
            retVal[k] = instanceCss[k] || defaultCss[k];
        }

        return retVal;
    }

    // create resizable instance
    function ApacheChief(el, options) {
        this.el = el;
        this.$el = $(el);
        // extend options with developer defined options
        this.options = $.extend({}, defaults, options);

        // extend isn't deep, so ensure that handle css is merged properly
        mergeResizeHandleCss(this.options, options || {});

        // create resize handles
        this.createResizeHandles();

        // bind event handlers
        this.bind();
    }

    // create resize handles
    ApacheChief.prototype.createResizeHandles = function () {
        var handlesCss = this.options.handlesCss;
        var handles = this.options.handles;
        var $handles;

        // loop the resize handles CSS hash, create elements,
        // and append them to this.$el
        // data-handle attribute is used to help determine what element
        // properties should be adjusted when resizing
        for (var i = 0; i < handles.length; i++) {
            if (handlesCss[handles[i]]) {
                this.$el
                    .append($('<div class="apache-chief-resize" data-handle="' + handles[i] + '">')
                    .css(handlesCss[handles[i]]));
            }
        }

        $handles = this.$el.find('.apache-chief-resize');
        // ensure that container is an offset parent for positioning handles
        if (this.$el !== $handles.offsetParent()) {
            this.$el.css('position', 'relative');
        }
        $handles.css('display', 'block');
    };

    // bind event handlers
    ApacheChief.prototype.bind = function () {
        var self = this;

        $('body').on('mouseup.apache-chief', function (e) {
            $(window).off('mousemove.apache-chief');
        });

        this.$el.find('.apache-chief-resize').on('mousedown.apache-chief', function (e) {
            var $handle = $(this);
            var direction = $handle.attr('data-handle');
            // if true then the handle moves in a position that only affects width and height
            var adjustPosition = direction !== 'BM' &&
                direction !== 'MR' && direction !== 'BR';
            // get the initial mouse position
             var mousePos = {
                x: e.pageX,
                y: e.pageY
            };

            // get coordinates for resizing
            function getPositionDiffs(adjustPosition, e, mousePos, direction) {
                var diffs = {
                    xDim: direction === 'BM' ? 0 : e.pageX - mousePos.x,
                    yDim: direction === 'MR' ? 0 : e.pageY - mousePos.y,
                    xPos: 0,
                    yPos: 0
                };

                if (!adjustPosition) {
                    return diffs;
                }

                switch (direction) {
                    case 'TR':
                        diffs.yPos = diffs.yDim;
                        diffs.yDim = -diffs.yDim;
                        break;
                    case 'TL':
                        diffs.xPos = diffs.xDim;
                        diffs.xDim = -diffs.xDim;
                        diffs.yPos = diffs.yDim;
                        diffs.yDim = -diffs.yDim;
                        break;
                    case 'BL':
                        diffs.xPos = diffs.xDim;
                        diffs.xDim = -diffs.xDim;
                        break;
                    case 'ML':
                        diffs.xPos = diffs.xDim;
                        diffs.xDim = -diffs.xDim;
                        diffs.yDim = 0;
                        break;
                    case 'TM':
                        diffs.yPos = diffs.yDim;
                        diffs.yDim = -diffs.yDim;
                        diffs.xDim = 0;
                        break;
                }

                return diffs;
            }

            $(window).on('mousemove.apache-chief', function (e) {
                // get the differences between the mousedown position and the
                // position from the mousemove events
                var diffs = getPositionDiffs(adjustPosition, e, mousePos, direction);
                // get the draggable el current position relative to the document
                var elPos;

                // prevent text selection
                e.preventDefault();

                // adjust the width and height
                self.$el.css({
                    width: self.$el.width() + diffs.xDim,
                    height: self.$el.height() + diffs.yDim
                });

                // adjust the top and bottom
                if (adjustPosition) {
                    elPos = self.$el.offset();
                    self.$el.css({
                        top: elPos.top + diffs.yPos,
                        left: elPos.left + diffs.xPos,
                        position: 'absolute'
                    });
                }

                // store the current mouse position
                // to diff with the next mousemove positions
                mousePos = {
                    x: e.pageX,
                    y: e.pageY
                };
            });
        });
    };

    // clean up instance
    ApacheChief.prototype.destroy = function () {
        this.$el.off('mousedown.apache-chief');
        // remove the resize handles
        this.$el.find('.apache-chief-resize').remove();

        this.el = null;
        this.$el = null;
        this.options = defaults;
    };

    return ApacheChief;

})(window, jQuery);