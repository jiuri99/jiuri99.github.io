/**
 * 让 Live2D 看板娘支持拖动
 * L2Dwidget 的容器默认 pointer-events: none，需改为 auto 并优先用捕获阶段处理
 */
(function () {
    var widgetId = 'live2d-widget';
    var maxWait = 8000;
    var interval = 150;
    var elapsed = 0;

    function makeDraggable(el) {
        if (el._live2dDraggable) return;
        el._live2dDraggable = true;

        /* 关键：L2Dwidget 给容器设置了 pointer-events: none，必须改掉才能接收点击 */
        el.style.pointerEvents = 'auto';
        /* 平时显示“抓手”光标（小手可抓），按下左键拖动时显示“抓取中”（grabbing） */
        el.style.cursor = 'grab';
        el.title = '按住左键拖动';

        var dragging = false;
        var startX, startY, startLeft, startTop;

        function getStyleNum(elm, prop) {
            var v = window.getComputedStyle(elm)[prop];
            return v ? parseInt(v, 10) : 0;
        }

        function startDrag(clientX, clientY) {
            dragging = true;
            startX = clientX;
            startY = clientY;
            var right = el.style.right;
            var bottom = el.style.bottom;
            if (right !== '' && right !== 'auto') {
                startLeft = window.innerWidth - getStyleNum(el, 'right') - el.offsetWidth;
            } else {
                startLeft = getStyleNum(el, 'left') || 0;
            }
            if (bottom !== '' && bottom !== 'auto') {
                startTop = window.innerHeight - getStyleNum(el, 'bottom') - el.offsetHeight;
            } else {
                startTop = getStyleNum(el, 'top') || 0;
            }
            el.style.right = 'auto';
            el.style.bottom = 'auto';
            el.style.left = startLeft + 'px';
            el.style.top = startTop + 'px';
        }

        function moveDrag(clientX, clientY) {
            if (!dragging) return;
            var dx = clientX - startX;
            var dy = clientY - startY;
            var left = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, startLeft + dx));
            var top = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, startTop + dy));
            el.style.left = left + 'px';
            el.style.top = top + 'px';
        }

        function endDrag() {
            dragging = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onTouchMove, { passive: false });
            document.removeEventListener('touchend', onTouchEnd);
        }

        function onMouseMove(e) {
            moveDrag(e.clientX, e.clientY);
        }
        function onMouseUp() {
            endDrag();
        }
        function onTouchMove(e) {
            if (dragging && e.touches.length === 1) {
                e.preventDefault();
                moveDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        }
        function onTouchEnd() {
            endDrag();
        }

        /* 用捕获阶段在 document 上监听，确保比 L2Dwidget 的 window 监听先执行 */
        document.addEventListener('mousedown', function (e) {
            if (e.button !== 0) return;
            if (!el.contains(e.target)) return;
            e.preventDefault();
            e.stopPropagation();
            startDrag(e.clientX, e.clientY);
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }, true);

        document.addEventListener('touchstart', function (e) {
            if (e.touches.length !== 1) return;
            if (!el.contains(e.target)) return;
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
        }, true);
    }

    function tryInit() {
        var el = document.getElementById(widgetId);
        if (el) {
            makeDraggable(el);
            return true;
        }
        elapsed += interval;
        if (elapsed < maxWait) {
            setTimeout(tryInit, interval);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(tryInit, 300);
        });
    } else {
        setTimeout(tryInit, 300);
    }
})();
