(function ($, window) {

    var kendo = window.kendo,
        ui = kendo.ui,
        extend = $.extend,
        Component = ui.Component,
        MOUSEENTER = 'mouseenter',
        MOUSELEAVE = 'mouseleave',
        CLICK = 'click',
        clickableItems = '.t-item:not(.t-state-disabled) > .t-link',
        disabledItems = '.t-item.t-state-disabled > .t-link',
        selectedClass = '.t-state-selected',
        disabledClass = '.t-state-disabled',
        defaultState = 't-state-default',
        VISIBLE = ':visible',
        EMPTY = ':empty',
        expandModes = {
            'single': 0,
            'multi': 1
        };

    var PanelBar = Component.extend({
        init: function(element, options) {
            element = $(element);
            var that = this,
                content = element.find('li.t-state-active > .t-content');

            Component.fn.init.call(that, element, options);

            options = that.options;

            element
                .delegate(clickableItems, CLICK, $.proxy(that._click, that))
				.delegate(clickableItems, MOUSEENTER + ' ' + MOUSELEAVE, that._toggleHover)
                .delegate(disabledItems, CLICK, false);

            element.bind({
                expand: that.options.onExpand,
                collapse: that.options.onCollapse,
                select: function (e) {
                    if (e.target == that.element && that.options.onSelect) that.options.onSelect(e);
                },
                error: that.options.onError,
                load: that.options.onLoad
            });

            if (this.contentUrls)
                element.find('> .t-item')
                    .each(function(index, item) {
                        $(item).find('.t-link').data('ContentUrl', that.contentUrls[index]);
                    });

            if (content.length > 0 && content.is(EMPTY))
                that.expand(content.parent());
        },
        options: {
            animation: {
                open: {
                    effects: 'expandVertical',
                    duration: 200,
                    show: true
                },
                close: { // if close animation effects are defined, they will be used instead of open.reverse
                    duration: 200,
                    show: false,
                    hide: true
                }
            },
            expandMode: 'multi'
        },

        expand: function (element) {
            var that = this;
            
            $(element).each(function (index, item) {
                item = $(item);
                if (!item.hasClass(disabledClass) && item.find('> .t-group, > .t-content').length > 0) {

                    if (that.options.expandMode == expandModes.single && that._collapseAllExpanded(item))
                        return;

                    that._toggleItem(item, false, null);
                }
            });
        },

        collapse: function (element) {
            var that = this;

            $(element).each(function (index, item) {
                item = $(item);

                if (!item.hasClass(disabledClass) && item.find('> .t-group, > .t-content').is(VISIBLE))
                    that._toggleItem(item, true, null);

            });
        },

        toggle: function (element, enable) {
            $(element).each(function () {
                $(this)
                    .toggleClass(defaultState, enable)
				    .toggleClass(disabledClass.substr(1), !enable);
            });
        },

        enable: function (element) {
            this.toggle(element, true);
        },

        disable: function (element) {
            this.toggle(element, false);
        },

        _toggleHover: function(e) {
            $(e.currentTarget).toggleClass('t-state-hover', e.type == MOUSEENTER);
        },

        _click: function (e) {
            var that = this,
                target = $(e.currentTarget),
                element = that.element;

            if (target.closest('.t-widget')[0] != element[0])
                return;

            var link = target.closest('.t-link'),
                item = link.closest('.t-item');

            $(selectedClass, element).removeClass(selectedClass.substr(1));

            link.addClass(selectedClass.substr(1));

            if (that.trigger(element, 'select', { item: item[0] })) {
                e.preventDefault();
            }

            var contents = item.find('> .t-content, > .t-group'),
                href = link.attr('href'),
                isAnchor = link.data('ContentUrl') || (href && (href.charAt(href.length - 1) == '#' || href.indexOf('#' + element.id + '-') != -1));

            if (isAnchor || contents.length > 0)
                e.preventDefault();
            else
                return;

            if (that.options.expandMode == expandModes.single)
                if (that._collapseAllExpanded(item))
                    return;

            if (contents.length != 0) {
                var visibility = contents.is(VISIBLE);

                if (!that.trigger(element, !visibility ? 'expand' : 'collapse', { item: item[0] }))
                    that._toggleItem(item, visibility, e);
            }
        },

        _toggleItem: function (element, isVisible, e) {
            var that = this,
                childGroup = element.find('> .t-group');

            if (childGroup.length) {

                this._toggleGroup(childGroup, isVisible);

                if (e != null)
                    e.preventDefault();
            } else {

                var itemIndex = element.parent().children().index(element),
                    content = element.find('> .t-content');

                if (content.length) {
                    if (e != null)
                        e.preventDefault();

                    if (!content.is(EMPTY))
                        that._toggleGroup(content, isVisible);
                    else
                        that._ajaxRequest(element, content, isVisible);
                }
            }
        },

        _toggleGroup: function (element, visibility) {
            var that = this,
                hasCloseAnimation = 'effects' in that.options.animation.close,
                closeAnimation = extend({}, that.options.animation.open);

            if (element.is(VISIBLE) != visibility)
                return;

            visibility && element.css('height', element.height()); // Set initial height on visible items (due to a Chrome bug/feature).
            element.css('height');

            element
                .parent()
	            .toggleClass(defaultState, visibility)
				.toggleClass('t-state-active', !visibility)
				.find('> .t-link > .t-icon')
					.toggleClass('t-arrow-up', !visibility)
					.toggleClass('t-panelbar-collapse', !visibility)
					.toggleClass('t-arrow-down', visibility)
					.toggleClass('t-panelbar-expand', visibility);

            element
                .kendoStop(true, true)
                .kendoAnimate(extend( hasCloseAnimation && visibility ?
                                          that.options.animation.close :
                                          !hasCloseAnimation && visibility ?
                                               extend(closeAnimation, { show: false, hide: true }) :
                                               that.options.animation.open, {
                                                   reverse: !hasCloseAnimation && visibility
                                               }));
        },

        _collapseAllExpanded: function (item) {
            var that = this;

            if (item.find('> .t-link').hasClass('t-header')) {
                if (item.find('> .t-content, > .t-group').is(VISIBLE) || item.find('> .t-content, > .t-group').length == 0) {
                    return true;
                } else {
                    $(that.element).children().find('> .t-content, > .t-group')
                            .filter(function () { return $(this).is(VISIBLE) })
                            .each(function (index, content) {
                                that._toggleGroup($(content), true);
                            });
                }
            }
        },

        _ajaxRequest: function (element, contentElement, isVisible) {

            var that = this,
                statusIcon = element.find('.t-panelbar-collapse, .t-panelbar-expand'),
                link = element.find('.t-link'),
                loadingIconTimeout = setTimeout(function () {
                    statusIcon.addClass('t-loading');
                }, 100),
                data = {};

            $.ajax({
                type: 'GET',
                cache: false,
                url: link.data('ContentUrl') || link.attr('href'),
                dataType: 'html',
                data: data,

                error: function (xhr, status) {
                    if (that.options.ajaxError(that.element, 'error', xhr, status))
                        return;
                },

                complete: function () {
                    clearTimeout(loadingIconTimeout);
                    statusIcon.removeClass('t-loading');
                },

                success: function (data, textStatus) {
                    contentElement.html(data);
                    that._toggleGroup(contentElement, isVisible);
                }
            });
        }
    });

    extend(PanelBar, {
        create: function () {
        }
    });

    kendo.ui.plugin("PanelBar", PanelBar, Component);

})(jQuery, window);
