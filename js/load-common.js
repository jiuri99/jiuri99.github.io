/**
 * 动态加载公共头部和底部，减少各页面重复代码
 */
(function () {
    function loadPartial(name, targetId) {
        var el = document.getElementById(targetId);
        if (!el) return Promise.resolve();
        var url = '/partials/' + name + '.html';
        return fetch(url).then(function (r) { return r.text(); }).then(function (html) {
            el.innerHTML = html;
        }).catch(function () {});
    }

    Promise.all([
        loadPartial('header', 'site-header'),
        loadPartial('footer', 'site-footer')
    ]).then(function () {
        if (window.M && typeof window.M.Sidenav !== 'undefined') {
            var sidenav = document.querySelector('.sidenav');
            if (sidenav) window.M.Sidenav.init(sidenav, {});
        }
        /* 导航栏：滚到顶透明，往下滚显示背景（header 为异步注入，须在此绑定） */
        var nav = document.getElementById('headNav');
        var backTop = document.querySelector('.top-scroll');
        var showPosition = 100;
        function showOrHideNavBg() {
            var top = window.pageYOffset || document.documentElement.scrollTop;
            if (nav) {
                if (top < showPosition) {
                    nav.classList.add('nav-transparent');
                } else {
                    nav.classList.remove('nav-transparent');
                }
            }
            if (backTop) {
                backTop.style.display = top < showPosition ? 'none' : '';
            }
        }
        showOrHideNavBg();
        window.addEventListener('scroll', showOrHideNavBg, { passive: true });
        var s = document.createElement('script');
        s.src = '/js/search.js';
        document.body.appendChild(s);
    });
})();
