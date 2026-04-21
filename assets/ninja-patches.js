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

  function initProductUpload() {
    var dropzone = document.querySelector('[data-upload-dropzone]');
    var input = document.querySelector('[data-upload-input]');
    var filename = document.querySelector('[data-upload-filename]');
    var progressBox = document.querySelector('[data-upload-progress]');
    var progressFill = document.querySelector('[data-upload-fill]');
    var progressPercent = document.querySelector('[data-upload-percent]');
    var progressStop = document.querySelector('[data-upload-stop]');
    var reviewBox = document.querySelector('[data-upload-review]');
    var reviewImage = document.querySelector('[data-upload-preview-image]');
    var changeFile = document.querySelector('[data-upload-change]');
    var zoomWrap = document.querySelector('[data-upload-zoom-wrap]');
    var zoomPane = document.querySelector('[data-upload-zoom-pane]');
    var zoomFrame = document.querySelector('[data-upload-zoom-frame]');
    if (!dropzone || !input || !filename) return;

    var progressTimer = null;
    var progressValue = 0;
    var previewUrl = '';

    function renderProgress() {
      if (!progressFill || !progressPercent) return;
      progressFill.style.width = progressValue + '%';
      progressPercent.textContent = Math.round(progressValue) + '%';
    }

    function stopProgress(hide) {
      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
      if (hide && progressBox) progressBox.hidden = true;
    }

    function clearPreviewUrl() {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = '';
      }
    }

    function resetUploadUi() {
      dropzone.hidden = false;
      if (progressBox) progressBox.hidden = true;
      if (reviewBox) reviewBox.hidden = true;
      if (zoomWrap) zoomWrap.classList.remove('is-zooming');
      progressValue = 0;
      renderProgress();
      clearPreviewUrl();
      if (reviewImage) reviewImage.removeAttribute('src');
      if (zoomPane) zoomPane.style.backgroundImage = '';
    }

    function startProgress() {
      if (!progressBox) return;
      dropzone.hidden = true;
      progressBox.hidden = false;
      if (reviewBox) reviewBox.hidden = true;
      progressValue = 0;
      renderProgress();
      stopProgress(false);
      progressTimer = setInterval(function () {
        if (progressValue < 100) {
          progressValue += Math.random() * 18 + 8;
          if (progressValue > 100) progressValue = 100;
          renderProgress();
        } else if (input.files && input.files.length > 0) {
          stopProgress(false);
          setTimeout(function () {
            if (progressBox) progressBox.hidden = true;
            if (reviewBox) reviewBox.hidden = false;
          }, 500);
        }
      }, 220);
    }

    function setFilename() {
      filename.textContent =
        input.files && input.files.length > 0
          ? input.files[0].name
          : 'No file selected';
      if (input.files && input.files.length > 0) {
        if (reviewImage) {
          clearPreviewUrl();
          previewUrl = URL.createObjectURL(input.files[0]);
          reviewImage.src = previewUrl;
          if (zoomPane) zoomPane.style.backgroundImage = 'url("' + previewUrl + '")';
        }
        if (reviewBox) reviewBox.hidden = true;
        startProgress();
      } else {
        resetUploadUi();
        stopProgress(true);
      }
    }

    input.addEventListener('change', setFilename);

    ['dragenter', 'dragover'].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('is-dragover');
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('is-dragover');
      });
    });

    dropzone.addEventListener('drop', function (e) {
      if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length)
        return;
      input.files = e.dataTransfer.files;
      setFilename();
    });

    if (progressStop) {
      progressStop.addEventListener('click', function () {
        input.value = '';
        filename.textContent = 'No file selected';
        resetUploadUi();
        stopProgress(true);
      });
    }

    if (changeFile) {
      changeFile.addEventListener('click', function () {
        input.click();
      });
    }

    function bindZoom() {
      if (!zoomFrame || !zoomPane || !zoomWrap || !reviewImage) return;

      zoomFrame.addEventListener('mousemove', function (e) {
        if (!reviewImage.src) return;
        if (window.innerWidth < 900) return;
        var rect = zoomFrame.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        x = Math.min(100, Math.max(0, x));
        y = Math.min(100, Math.max(0, y));
        zoomPane.style.backgroundPosition = x + '% ' + y + '%';
      });

      zoomFrame.addEventListener('mouseenter', function () {
        if (!reviewImage.src) return;
        if (window.innerWidth < 900) return;
        zoomWrap.classList.add('is-zooming');
      });

      zoomFrame.addEventListener('mouseleave', function () {
        zoomWrap.classList.remove('is-zooming');
      });

      zoomFrame.addEventListener('click', function () {
        if (!reviewImage.src) return;
        window.open(reviewImage.src, '_blank');
      });
    }

    bindZoom();

    // Ensure clean initial state on page load.
    resetUploadUi();
  }

  initProductUpload();
})();
