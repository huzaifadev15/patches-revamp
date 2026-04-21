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
    var patchSizer = document.querySelector('[data-patch-sizer]');
    var checkoutWrap = document.querySelector('[data-checkout-wrap]');
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
      if (patchSizer) patchSizer.hidden = true;
      if (checkoutWrap) checkoutWrap.hidden = true;
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
            if (patchSizer) patchSizer.hidden = false;
            if (checkoutWrap) checkoutWrap.hidden = false;
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
        if (patchSizer) patchSizer.hidden = true;
        if (checkoutWrap) checkoutWrap.hidden = true;
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

    function initPatchSizer() {
      var sizer = document.querySelector('[data-patch-sizer]');
      if (!sizer) return;
      var widthInput = sizer.querySelector('[data-size-width]');
      var heightInput = sizer.querySelector('[data-size-height]');
      var qtyInput = sizer.querySelector('[data-size-qty]');
      var priceEl = sizer.querySelector('[data-size-price]');
      var totalEl = sizer.querySelector('[data-size-total]');
      var avgEl = sizer.querySelector('[data-size-average]');
      var notesToggle = sizer.querySelector('[data-notes-toggle]');
      var notesField = sizer.querySelector('[data-notes-field]');
      var calcUnitHidden = document.querySelector('[data-calc-unit-hidden]');
      var calcTotalHidden = document.querySelector('[data-calc-total-hidden]');
      var calcQuoteTokenHidden = document.querySelector('[data-calc-quote-token-hidden]');
      var tierBody = document.querySelector('[data-tier-body]');
      var pricingUrl = sizer.getAttribute('data-pricing-url');
      var productName = (sizer.getAttribute('data-product-name') || '').trim();
      var quoteUrl = (sizer.getAttribute('data-quote-url') || '').trim();
      var basePrice = 6.71;
      var pricingRows = [];
      var pricingReady = false;
      var quoteTimer = null;
      var quoteRequestId = 0;

      function clampQty(v) {
        var n = parseInt(v || '10', 10);
        if (isNaN(n) || n < 10) n = 10;
        return n;
      }

      function selectClosestSize(sizeRows, heightValue) {
        if (!sizeRows.length) return null;
        var best = sizeRows[0];
        var bestDiff = Math.abs((best.size || 0) - heightValue);
        for (var i = 1; i < sizeRows.length; i++) {
          var diff = Math.abs((sizeRows[i].size || 0) - heightValue);
          if (diff < bestDiff) {
            best = sizeRows[i];
            bestDiff = diff;
          }
        }
        return best;
      }

      function getClosestSizeRows(heightValue) {
        if (!pricingReady || pricingRows.length === 0) return [];
        var sizeMatches = pricingRows.filter(function (row) {
          return typeof row.size === 'number' && typeof row.quantity === 'number';
        });
        if (sizeMatches.length === 0) return [];
        var sizes = [];
        sizeMatches.forEach(function (row) {
          if (sizes.indexOf(row.size) === -1) sizes.push(row.size);
        });
        var closestSize = selectClosestSize(
          sizes.map(function (s) {
            return { size: s };
          }),
          heightValue
        );
        if (!closestSize) return [];
        return sizeMatches
          .filter(function (row) {
            return row.size === closestSize.size;
          })
          .sort(function (a, b) {
            return a.quantity - b.quantity;
          });
      }

      function calcUnitPrice(qty, heightValue) {
        var sizeRows = getClosestSizeRows(heightValue);
        if (sizeRows.length > 0) {
          var selected = sizeRows[0];
          for (var i = 0; i < sizeRows.length; i++) {
            if (qty >= sizeRows[i].quantity) selected = sizeRows[i];
          }
          var parsed = parseFloat(selected.price);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }

        if (qty >= 500) return 1.68;
        if (qty >= 200) return 2.35;
        if (qty >= 100) return 3.35;
        if (qty >= 50) return 4.36;
        if (qty >= 25) return 5.03;
        return basePrice;
      }

      function updateSizer() {
        var w = parseFloat(widthInput.value || '2');
        var h = parseFloat(heightInput.value || '2.19');
        if (isNaN(w) || w < 1) w = 1;
        if (isNaN(h) || h < 1) h = 1;
        var qty = clampQty(qtyInput.value);
        qtyInput.value = qty;
        var unit = calcUnitPrice(qty, h);
        var total = unit * qty;
        if (priceEl) priceEl.textContent = '$' + unit.toFixed(2);
        if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
        if (avgEl) avgEl.textContent = ((w + h) / 2).toFixed(1) + '"';
        if (calcUnitHidden) calcUnitHidden.value = '$' + unit.toFixed(2);
        if (calcTotalHidden) calcTotalHidden.value = '$' + total.toFixed(2);
        if (calcQuoteTokenHidden) calcQuoteTokenHidden.value = '';
        renderTierTable(h, qty);
        requestQuoteFromBackend(w, h, qty);
      }

      function collectOptions() {
        var options = {};
        sizer.querySelectorAll('[data-option-group]').forEach(function (group) {
          var key = group.getAttribute('data-option-group');
          var hidden = group.querySelector('[data-option-hidden]');
          if (!key || !hidden) return;
          options[key] = hidden.value || '';
        });
        var bgInput = sizer.querySelector('input[name="properties[Patch Background Color]"]');
        var borderThreadInput = sizer.querySelector('input[name="properties[Border Thread Color]"]');
        if (bgInput) options.backgroundColor = bgInput.value || '';
        if (borderThreadInput) options.borderThreadColor = borderThreadInput.value || '';
        return options;
      }

      function setCalculatedValues(unit, total, quoteToken) {
        if (priceEl) priceEl.textContent = '$' + unit.toFixed(2);
        if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
        if (calcUnitHidden) calcUnitHidden.value = '$' + unit.toFixed(2);
        if (calcTotalHidden) calcTotalHidden.value = '$' + total.toFixed(2);
        if (calcQuoteTokenHidden) calcQuoteTokenHidden.value = quoteToken || '';
      }

      function requestQuoteFromBackend(width, height, qty) {
        if (!quoteUrl) return;
        if (quoteTimer) clearTimeout(quoteTimer);
        quoteTimer = setTimeout(function () {
          quoteRequestId += 1;
          var reqId = quoteRequestId;
          fetch(quoteUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productName: productName,
              width: width,
              height: height,
              qty: qty,
              options: collectOptions()
            })
          })
            .then(function (res) {
              if (!res.ok) throw new Error('quote request failed');
              return res.json();
            })
            .then(function (data) {
              if (reqId !== quoteRequestId) return;
              if (!data || data.ok !== true) return;
              var unit = parseFloat(data.unitPrice);
              var total = parseFloat(data.total);
              if (isNaN(unit) || isNaN(total)) return;
              setCalculatedValues(unit, total, data.quoteToken || '');
            })
            .catch(function () {
              // Keep local pricing results as fallback.
            });
        }, 250);
      }

      function renderTierTable(heightValue, qty) {
        if (!tierBody) return;
        var rows = getClosestSizeRows(heightValue);
        if (rows.length === 0) return;

        var base = parseFloat(rows[0].price) || 0;
        var html = '';
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var next = rows[i + 1];
          var range = next ? row.quantity + '-' + (next.quantity - 1) : row.quantity + '+';
          var price = parseFloat(row.price) || 0;
          var discount = base > 0 ? Math.max(0, Math.round((1 - price / base) * 100)) : 0;
          var active = qty >= row.quantity && (!next || qty < next.quantity);
          html +=
            '<tr' +
            (active ? ' class="is-active"' : '') +
            '><td>' +
            range +
            '</td><td>$' +
            price.toFixed(2) +
            ' ea</td><td' +
            (discount > 0 ? ' class="is-green"' : '') +
            '>' +
            (discount > 0 ? discount + '% off' : '-') +
            '</td></tr>';
        }
        tierBody.innerHTML = html;
      }

      function stepValue(input, delta) {
        var v = parseFloat(input.value || '0');
        if (isNaN(v)) v = 1;
        v = Math.max(1, v + delta);
        input.value = Math.round(v * 100) / 100;
        updateSizer();
      }

      sizer.querySelectorAll('[data-size-inc]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var target = btn.getAttribute('data-size-inc');
          stepValue(target === 'width' ? widthInput : heightInput, 0.1);
        });
      });

      sizer.querySelectorAll('[data-size-dec]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var target = btn.getAttribute('data-size-dec');
          stepValue(target === 'width' ? widthInput : heightInput, -0.1);
        });
      });

      [widthInput, heightInput, qtyInput].forEach(function (el) {
        if (!el) return;
        el.addEventListener('input', updateSizer);
        el.addEventListener('change', updateSizer);
      });

      if (notesToggle && notesField) {
        notesToggle.addEventListener('change', function () {
          notesField.hidden = !notesToggle.checked;
        });
      }

      sizer
        .querySelectorAll(
          'input[name="properties[Patch Background Color]"], input[name="properties[Border Thread Color]"]'
        )
        .forEach(function (input) {
          input.addEventListener('input', updateSizer);
          input.addEventListener('change', updateSizer);
        });

      sizer.querySelectorAll('[data-option-group]').forEach(function (group) {
        var hidden = group.querySelector('[data-option-hidden]');
        var label = group.querySelector('[data-option-selected-label]');
        var cards = group.querySelectorAll('[data-option-value]');
        cards.forEach(function (card) {
          card.addEventListener('click', function () {
            cards.forEach(function (c) {
              c.classList.remove('is-active');
            });
            card.classList.add('is-active');
            var value = card.getAttribute('data-option-value') || '';
            if (hidden) hidden.value = value;
            if (label) label.textContent = value;
            updateSizer();
          });
        });
      });

      function normalize(name) {
        return (name || '')
          .toLowerCase()
          .replace(/&/g, ' and ')
          .replace(/[^a-z0-9]+/g, ' ')
          .trim();
      }

      function includesWords(haystack, needle) {
        var h = normalize(haystack);
        var n = normalize(needle);
        if (!h || !n) return false;
        return h.indexOf(n) !== -1;
      }

      function loadPricing() {
        if (!pricingUrl) {
          pricingReady = true;
          updateSizer();
          return;
        }
        fetch(pricingUrl)
          .then(function (res) {
            return res.json();
          })
          .then(function (rows) {
            var aliases = [
              '3D Embroidered patch',
              '3D Embroidered',
              'Embroidered & 3D Embroidered',
              productName
            ].filter(Boolean);

            var matches = [];
            for (var a = 0; a < aliases.length; a++) {
              var alias = aliases[a];
              matches = (rows || []).filter(function (row) {
                return normalize(row.name) === normalize(alias);
              });
              if (matches.length > 0) break;
            }

            if (matches.length === 0) {
              matches = (rows || []).filter(function (row) {
                return (
                  includesWords(row.name, '3D Embroidered') ||
                  includesWords(row.name, productName)
                );
              });
            }
            pricingRows = matches;
            pricingReady = true;
            updateSizer();
          })
          .catch(function () {
            pricingReady = true;
            updateSizer();
          });
      }

      updateSizer();
      loadPricing();
    }

    initPatchSizer();

    // Ensure clean initial state on page load.
    resetUploadUi();
  }

  initProductUpload();
})();
