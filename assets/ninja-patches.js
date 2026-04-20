(function () {
  var root = document.documentElement;
  var utility = document.querySelector('[data-utility-bar]');
  var openBtn = document.querySelector('[data-mobile-open]');
  var closeBtn = document.querySelector('[data-mobile-close]');
  var panel = document.querySelector('[data-mobile-panel]');

  function onScroll() {
    if (!utility) return;
    var y = window.scrollY || window.pageYOffset;
    root.classList.toggle('header-utility-hidden', y > 36);
  }

  window.addEventListener(
    'scroll',
    function () {
      window.requestAnimationFrame(onScroll);
    },
    { passive: true }
  );

  function setMobileOpen(open) {
    if (!panel || !openBtn) return;
    panel.hidden = !open;
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('mobile-nav-open', open);
  }

  if (openBtn && panel) {
    openBtn.addEventListener('click', function () {
      setMobileOpen(panel.hidden);
    });
  }
  if (closeBtn && panel) {
    closeBtn.addEventListener('click', function () {
      setMobileOpen(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMobileOpen(false);
  });
})();
