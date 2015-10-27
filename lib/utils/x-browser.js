var browser = {
        isTouch: 'ontouchstart' in document.documentElement
    },
    touchEvents = {
        click: 'touchend',
        mouseenter: 'touchstart',
        mouseleave: 'touchend touchcancel touchmove'
    };

browser.event = function(event) {
    if (this.isTouch) {
        return touchEvents[event];
    } else {
        return event;
    }
};

module.exports = browser;
