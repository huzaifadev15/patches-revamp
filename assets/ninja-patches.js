(function () {
  var root = document.documentElement;
  var utility = document.querySelector('[data-utility-bar]');
  var openBtn = document.querySelector('[data-mobile-open]');
  var closeBtn = document.querySelector('[data-mobile-close]');
  var panel = document.querySelector('[data-mobile-panel]');
  var utilityHidden = false;

  function onScroll() {
    if (!utility) return;
    var y = window.scrollY || window.pageYOffset;
    // Use separate hide/show thresholds to prevent rapid toggle loops
    // when header height changes alter scroll position near a single cutoff.
    if (!utilityHidden && y > 72) {
      utilityHidden = true;
      root.classList.add('header-utility-hidden');
    } else if (utilityHidden && y < 24) {
      utilityHidden = false;
      root.classList.remove('header-utility-hidden');
    }
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
    var dimWidthLabel = document.querySelector('[data-upload-dim-width]');
    var dimHeightLabel = document.querySelector('[data-upload-dim-height]');
    var cropBtn = document.querySelector('[data-upload-crop]');
    var removeBgBtn = document.querySelector('[data-upload-remove-bg]');
    var deleteImageBtn = document.querySelector('[data-upload-delete]');
    var changeFile = document.querySelector('[data-upload-change]');
    var patchSizer = document.querySelector('[data-patch-sizer]');
    var checkoutWrap = document.querySelector('[data-checkout-wrap]');
    var zoomWrap = document.querySelector('[data-upload-zoom-wrap]');
    var zoomPane = document.querySelector('[data-upload-zoom-pane]');
    var zoomFrame = document.querySelector('[data-upload-zoom-frame]');
    var aiPromptInput = document.querySelector('[data-ai-prompt]');
    var aiGenerateBtn = document.querySelector('[data-ai-generate]');
    var aiStatus = document.querySelector('[data-ai-status]');
    var aiResults = document.querySelector('[data-ai-results]');
    var aiPromptHidden = document.querySelector('[data-ai-prompt-hidden]');
    var aiRequestHidden = document.querySelector('[data-ai-request-hidden]');
    var aiImageHidden = document.querySelector('[data-ai-image-hidden]');
    if (!dropzone || !input || !filename) return;

    var progressTimer = null;
    var progressValue = 0;
    var previewUrl = '';
    var autoSizeFromImage = null;
    var removeBgEnabled = false;
    var baseImageSrc = '';
    var aiGenerating = false;
    var aiGenerateUrl = patchSizer ? (patchSizer.getAttribute('data-ai-generate-url') || '').trim() : '';
    var aiStatusUrl = patchSizer ? (patchSizer.getAttribute('data-ai-status-url') || '').trim() : '';

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
        if (previewUrl !== baseImageSrc) {
          URL.revokeObjectURL(previewUrl);
        }
        previewUrl = '';
      }
    }

    function clearBaseImageSrc() {
      if (baseImageSrc) {
        URL.revokeObjectURL(baseImageSrc);
        baseImageSrc = '';
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
      clearBaseImageSrc();
      if (reviewImage) reviewImage.removeAttribute('src');
      removeBgEnabled = false;
      if (removeBgBtn) removeBgBtn.setAttribute('aria-pressed', 'false');
      if (zoomFrame) zoomFrame.classList.remove('is-transparent-bg');
      if (dimWidthLabel) dimWidthLabel.textContent = '2.00"';
      if (dimHeightLabel) dimHeightLabel.textContent = '2.19"';
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
          clearBaseImageSrc();
          previewUrl = URL.createObjectURL(input.files[0]);
          reviewImage.onload = function () {
            if (
              typeof autoSizeFromImage === 'function' &&
              reviewImage.naturalWidth > 0 &&
              reviewImage.naturalHeight > 0
            ) {
              autoSizeFromImage(reviewImage.naturalWidth, reviewImage.naturalHeight);
            }
          };
          reviewImage.src = previewUrl;
          baseImageSrc = previewUrl;
          removeBgEnabled = false;
          if (removeBgBtn) removeBgBtn.setAttribute('aria-pressed', 'false');
          if (zoomFrame) zoomFrame.classList.remove('is-transparent-bg');
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

    function updateInputFileFromBlob(blob, filenameBase) {
      if (!blob || !window.DataTransfer) return;
      var safeName = (filenameBase || 'design').replace(/\.[^.]+$/, '');
      var file = new File([blob], safeName + '.png', { type: 'image/png' });
      var dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      filename.textContent = file.name;
    }

    function showProcessedPreview(blob, filenameBase) {
      if (!blob || !reviewImage) return;
      stopProgress(true);
      dropzone.hidden = true;
      if (reviewBox) reviewBox.hidden = false;
      if (patchSizer) patchSizer.hidden = false;
      if (checkoutWrap) checkoutWrap.hidden = false;
      clearPreviewUrl();
      clearBaseImageSrc();
      previewUrl = URL.createObjectURL(blob);
      reviewImage.onload = function () {
        if (
          typeof autoSizeFromImage === 'function' &&
          reviewImage.naturalWidth > 0 &&
          reviewImage.naturalHeight > 0
        ) {
          autoSizeFromImage(reviewImage.naturalWidth, reviewImage.naturalHeight);
        }
      };
      reviewImage.src = previewUrl;
      baseImageSrc = previewUrl;
      removeBgEnabled = false;
      if (removeBgBtn) removeBgBtn.setAttribute('aria-pressed', 'false');
      if (zoomFrame) zoomFrame.classList.remove('is-transparent-bg');
      if (zoomPane) zoomPane.style.backgroundImage = 'url("' + previewUrl + '")';
      updateInputFileFromBlob(blob, filenameBase);
    }

    function loadPreviewImage(onReady) {
      if (!reviewImage || !reviewImage.src) return;
      var img = new Image();
      img.onload = function () {
        onReady(img);
      };
      img.src = reviewImage.src;
    }

    function canvasToBlob(canvas, callback) {
      if (!canvas) return;
      canvas.toBlob(
        function (blob) {
          if (blob) callback(blob);
        },
        'image/png',
        0.95
      );
    }

    function setAiStatus(message) {
      if (!aiStatus) return;
      aiStatus.textContent = message || '';
    }

    function clearAiResults() {
      if (aiResults) aiResults.innerHTML = '';
    }

    function normalizeImageArray(payload) {
      if (!payload) return [];
      if (Array.isArray(payload.images)) return payload.images;
      if (payload.image && payload.image.url) return [payload.image];
      if (payload.output && Array.isArray(payload.output.images)) return payload.output.images;
      if (payload.output && typeof payload.output === 'string') return [{ url: payload.output }];
      return [];
    }

    function resolveImageUrl(entry) {
      if (!entry) return '';
      if (typeof entry === 'string') return entry;
      if (typeof entry.url === 'string') return entry.url;
      if (typeof entry.src === 'string') return entry.src;
      return '';
    }

    function applyAiImage(url, idx) {
      if (!url) return Promise.reject(new Error('missing image url'));
      setAiStatus('Applying selected AI image...');
      return fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('failed to fetch generated image');
          return res.blob();
        })
        .then(function (blob) {
          var safeIndex = typeof idx === 'number' ? idx + 1 : 1;
          showProcessedPreview(blob, 'ai-patch-' + safeIndex);
          if (aiImageHidden) aiImageHidden.value = url;
          setAiStatus('AI image applied. You can continue with size and checkout.');
        })
        .catch(function () {
          setAiStatus('Could not apply image. Please try another result.');
        });
    }

    function renderAiResults(images) {
      if (!aiResults) return;
      clearAiResults();
      if (!images || images.length === 0) {
        setAiStatus('No image returned. Please try a different prompt.');
        return;
      }

      images.forEach(function (entry, idx) {
        var url = resolveImageUrl(entry);
        if (!url) return;

        var card = document.createElement('div');
        card.style.display = 'inline-block';
        card.style.marginRight = '10px';
        card.style.marginBottom = '10px';

        var img = document.createElement('img');
        img.src = url;
        img.alt = 'AI generated patch option ' + (idx + 1);
        img.style.width = '120px';
        img.style.height = '120px';
        img.style.objectFit = 'cover';
        img.style.display = 'block';
        img.style.marginBottom = '6px';
        img.loading = 'lazy';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Use this design';
        btn.addEventListener('click', function () {
          applyAiImage(url, idx);
        });

        card.appendChild(img);
        card.appendChild(btn);
        aiResults.appendChild(card);
      });
    }

    function pollAiStatus(requestId) {
      if (!aiStatusUrl || !requestId) return Promise.reject(new Error('status endpoint not configured'));
      var started = Date.now();
      var timeoutMs = 90000;
      var intervalMs = 2500;

      return new Promise(function (resolve, reject) {
        function tick() {
          var statusEndpoint = aiStatusUrl.replace(/\/$/, '') + '/' + encodeURIComponent(requestId);
          fetch(statusEndpoint)
            .then(function (res) {
              if (!res.ok) throw new Error('status request failed');
              return res.json();
            })
            .then(function (data) {
              var status = (data && data.status ? String(data.status) : '').toLowerCase();
              if (status === 'completed' || status === 'succeeded' || status === 'done') {
                resolve(data);
                return;
              }
              if (status === 'failed' || status === 'error' || status === 'cancelled') {
                reject(new Error((data && data.error) || 'generation failed'));
                return;
              }
              if (Date.now() - started > timeoutMs) {
                reject(new Error('generation timed out'));
                return;
              }
              setAiStatus('Generating image...');
              setTimeout(tick, intervalMs);
            })
            .catch(function (err) {
              if (Date.now() - started > timeoutMs) {
                reject(err);
                return;
              }
              setTimeout(tick, intervalMs);
            });
        }
        tick();
      });
    }

    function generateAiDesign() {
      if (!aiGenerateUrl || !aiStatusUrl) {
        setAiStatus('AI endpoint is not configured in theme settings.');
        return;
      }
      if (aiGenerating) return;
      var prompt = aiPromptInput ? (aiPromptInput.value || '').trim() : '';
      if (!prompt) {
        setAiStatus('Enter a prompt to generate a patch design.');
        return;
      }

      aiGenerating = true;
      if (aiGenerateBtn) aiGenerateBtn.disabled = true;
      clearAiResults();
      setAiStatus('Starting generation...');
      if (aiPromptHidden) aiPromptHidden.value = prompt;
      if (aiImageHidden) aiImageHidden.value = '';
      function finishGeneration() {
        aiGenerating = false;
        if (aiGenerateBtn) aiGenerateBtn.disabled = false;
      }

      fetch(aiGenerateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          provider: 'fal.ai',
          model: 'flux',
          productHandle: patchSizer ? (patchSizer.getAttribute('data-product-handle') || '') : ''
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('generate request failed');
          return res.json();
        })
        .then(function (data) {
          var requestId = data && (data.requestId || data.generation_id || data.id);
          if (!requestId) throw new Error('missing request id');
          if (aiRequestHidden) aiRequestHidden.value = requestId;
          setAiStatus('Generating image...');
          return pollAiStatus(requestId);
        })
        .then(function (statusData) {
          var images = normalizeImageArray(statusData);
          renderAiResults(images);
          if (images.length > 0) {
            setAiStatus('Select a design to apply it.');
          }
          finishGeneration();
        })
        .catch(function (err) {
          setAiStatus('Generation failed. ' + ((err && err.message) || 'Please try again.'));
          finishGeneration();
        });
    }

    function applyCropAndTrim() {
      if (!reviewImage || !reviewImage.src) return;
      var trimPercent = parseFloat(
        window.prompt('Trim % from each edge (0-30). Example: 5', '5') || '0'
      );
      if (isNaN(trimPercent)) trimPercent = 0;
      trimPercent = Math.max(0, Math.min(30, trimPercent));
      if (trimPercent === 0) return;

      loadPreviewImage(function (img) {
        var cropX = Math.round((img.width * trimPercent) / 100);
        var cropY = Math.round((img.height * trimPercent) / 100);
        var cropW = img.width - cropX * 2;
        var cropH = img.height - cropY * 2;
        if (cropW < 20 || cropH < 20) return;
        var canvas = document.createElement('canvas');
        canvas.width = cropW;
        canvas.height = cropH;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        canvasToBlob(canvas, function (blob) {
          showProcessedPreview(blob, 'cropped-design');
        });
      });
    }

    function processRemoveBackground(sourceSrc, onDone) {
      if (!sourceSrc) return;
      loadPreviewImage(function (img) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        var width = canvas.width;
        var height = canvas.height;
        var visited = new Uint8Array(width * height);
        var queueX = new Int32Array(width * height);
        var queueY = new Int32Array(width * height);
        var head = 0;
        var tail = 0;
        var borderSamples = [];
        var sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 120));
        var hardThreshold = 2.05;

        function idxFor(x, y) {
          return y * width + x;
        }

        function pixelIndex(x, y) {
          return (y * width + x) * 4;
        }

        function getRgb(x, y) {
          var i = pixelIndex(x, y);
          return [data[i], data[i + 1], data[i + 2]];
        }

        function pushBorderSample(x, y) {
          var rgb = getRgb(x, y);
          borderSamples.push(rgb);
        }

        for (var sx = 0; sx < width; sx += sampleStep) {
          pushBorderSample(sx, 0);
          pushBorderSample(sx, height - 1);
        }
        for (var sy = 0; sy < height; sy += sampleStep) {
          pushBorderSample(0, sy);
          pushBorderSample(width - 1, sy);
        }

        if (borderSamples.length === 0) {
          canvasToBlob(canvas, function (blob) {
            onDone(blob);
          });
          return;
        }

        var meanR = 0;
        var meanG = 0;
        var meanB = 0;
        for (var s = 0; s < borderSamples.length; s++) {
          meanR += borderSamples[s][0];
          meanG += borderSamples[s][1];
          meanB += borderSamples[s][2];
        }
        meanR /= borderSamples.length;
        meanG /= borderSamples.length;
        meanB /= borderSamples.length;

        var stdR = 0;
        var stdG = 0;
        var stdB = 0;
        for (var v = 0; v < borderSamples.length; v++) {
          stdR += Math.pow(borderSamples[v][0] - meanR, 2);
          stdG += Math.pow(borderSamples[v][1] - meanG, 2);
          stdB += Math.pow(borderSamples[v][2] - meanB, 2);
        }
        stdR = Math.max(18, Math.sqrt(stdR / borderSamples.length));
        stdG = Math.max(18, Math.sqrt(stdG / borderSamples.length));
        stdB = Math.max(18, Math.sqrt(stdB / borderSamples.length));

        function normalizedDistance(i) {
          var dr = (data[i] - meanR) / stdR;
          var dg = (data[i + 1] - meanG) / stdG;
          var db = (data[i + 2] - meanB) / stdB;
          return Math.sqrt(dr * dr + dg * dg + db * db);
        }

        function gradientStrength(x, y) {
          var i = pixelIndex(x, y);
          var x2 = Math.min(width - 1, x + 1);
          var y2 = Math.min(height - 1, y + 1);
          var ix = pixelIndex(x2, y);
          var iy = pixelIndex(x, y2);
          var dx =
            Math.abs(data[i] - data[ix]) +
            Math.abs(data[i + 1] - data[ix + 1]) +
            Math.abs(data[i + 2] - data[ix + 2]);
          var dy =
            Math.abs(data[i] - data[iy]) +
            Math.abs(data[i + 1] - data[iy + 1]) +
            Math.abs(data[i + 2] - data[iy + 2]);
          return Math.max(dx, dy);
        }

        function enqueue(x, y) {
          var idx = idxFor(x, y);
          if (visited[idx]) return;
          visited[idx] = 1;
          queueX[tail] = x;
          queueY[tail] = y;
          tail += 1;
        }

        for (var bx = 0; bx < width; bx++) {
          enqueue(bx, 0);
          enqueue(bx, height - 1);
        }
        for (var by = 0; by < height; by++) {
          enqueue(0, by);
          enqueue(width - 1, by);
        }

        while (head < tail) {
          var x = queueX[head];
          var y = queueY[head];
          head += 1;
          var i = pixelIndex(x, y);
          var score = normalizedDistance(i);
          var edge = gradientStrength(x, y);
          if (score > hardThreshold) continue;
          // Avoid crossing strong object edges while flooding from border.
          if (edge > 110) continue;
          data[i + 3] = 0;

          if (x > 0) enqueue(x - 1, y);
          if (x < width - 1) enqueue(x + 1, y);
          if (y > 0) enqueue(x, y - 1);
          if (y < height - 1) enqueue(x, y + 1);
        }

        ctx.putImageData(imageData, 0, 0);
        canvasToBlob(canvas, function (blob) {
          onDone(blob);
        });
      });
      function loadPreviewImage(onReady) {
        var image = new Image();
        image.onload = function () {
          onReady(image);
        };
        image.src = sourceSrc;
      }
    }

    function toggleRemoveBackground(enabled) {
      if (!reviewImage) return;
      removeBgEnabled = enabled;
      if (removeBgBtn) removeBgBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      if (zoomFrame) zoomFrame.classList.toggle('is-transparent-bg', enabled);
      if (!enabled) {
        if (baseImageSrc) {
          clearPreviewUrl();
          previewUrl = baseImageSrc;
          reviewImage.src = baseImageSrc;
          if (zoomPane) zoomPane.style.backgroundImage = 'url("' + baseImageSrc + '")';
        }
        return;
      }
      var src = baseImageSrc || reviewImage.src;
      processRemoveBackground(src, function (blob) {
        clearPreviewUrl();
        previewUrl = URL.createObjectURL(blob);
        reviewImage.src = previewUrl;
        if (zoomPane) zoomPane.style.backgroundImage = 'url("' + previewUrl + '")';
      });
    }

    function clearUploadedDesign() {
      input.value = '';
      filename.textContent = 'No file selected';
      resetUploadUi();
      stopProgress(true);
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
        clearUploadedDesign();
      });
    }

    if (deleteImageBtn) {
      deleteImageBtn.addEventListener('click', function () {
        clearUploadedDesign();
      });
    }

    if (cropBtn) {
      cropBtn.addEventListener('click', function () {
        applyCropAndTrim();
      });
    }

    if (removeBgBtn) {
      removeBgBtn.addEventListener('click', function () {
        toggleRemoveBackground(!removeBgEnabled);
      });
    }

    if (changeFile) {
      changeFile.addEventListener('click', function () {
        input.click();
      });
    }

    if (aiGenerateBtn) {
      aiGenerateBtn.addEventListener('click', generateAiDesign);
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
      var calcCustomPriceHidden = document.querySelector('[data-calc-custom-price-hidden]');
      var calcQuoteTokenHidden = document.querySelector('[data-calc-quote-token-hidden]');
      var tierBody = document.querySelector('[data-tier-body]');
      var pricingUrl = sizer.getAttribute('data-pricing-url');
      var productName = (sizer.getAttribute('data-product-name') || '').trim();
      var productType = (sizer.getAttribute('data-product-type') || '').trim();
      var productHandle = (sizer.getAttribute('data-product-handle') || '').trim();
      var quoteUrl = (sizer.getAttribute('data-quote-url') || '').trim();
      var basePrice = 6.71;
      var pricingRows = [];
      var pricingReady = false;
      var quoteTimer = null;
      var quoteRequestId = 0;

      function formatInches(value) {
        return value.toFixed(2) + '"';
      }

      function updatePreviewDimensions(width, height) {
        if (dimWidthLabel) dimWidthLabel.textContent = formatInches(width);
        if (dimHeightLabel) dimHeightLabel.textContent = formatInches(height);
      }

      function setDimensionsFromImageAspect(naturalWidth, naturalHeight) {
        if (!widthInput || !heightInput) return;
        if (!naturalWidth || !naturalHeight) return;
        var ratio = naturalWidth / naturalHeight;
        var baseShortSide = 2;
        var width = baseShortSide;
        var height = baseShortSide;
        if (ratio >= 1) {
          width = baseShortSide * ratio;
          height = baseShortSide;
        } else {
          width = baseShortSide;
          height = baseShortSide / ratio;
        }
        widthInput.value = (Math.round(width * 100) / 100).toFixed(2);
        heightInput.value = (Math.round(height * 100) / 100).toFixed(2);
        updateSizer();
      }

      autoSizeFromImage = setDimensionsFromImageAspect;

      function clampQty(v) {
        var n = parseInt(v || '10', 10);
        if (isNaN(n) || n < 10) n = 10;
        return n;
      }

      function selectNextAvailableSize(sizes, requestedSize) {
        if (!sizes.length) return null;
        var sorted = sizes.slice().sort(function (a, b) {
          return a - b;
        });
        for (var i = 0; i < sorted.length; i++) {
          if (sorted[i] >= requestedSize) return sorted[i];
        }
        // If requested size is larger than all available, use largest available.
        return sorted[sorted.length - 1];
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
        var selectedSize = selectNextAvailableSize(sizes, heightValue);
        if (selectedSize == null) return [];
        return sizeMatches
          .filter(function (row) {
            return row.size === selectedSize;
          })
          .sort(function (a, b) {
            return a.quantity - b.quantity;
          });
      }

      function calcUnitPrice(qty, sizeValue) {
        var sizeRows = getClosestSizeRows(sizeValue);
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
        var sizeValue = Math.max(w, h);
        var qty = clampQty(qtyInput.value);
        qtyInput.value = qty;
        var unit = calcUnitPrice(qty, sizeValue);
        var total = unit * qty;
        if (priceEl) priceEl.textContent = '$' + unit.toFixed(2);
        if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
        if (avgEl) avgEl.textContent = ((w + h) / 2).toFixed(1) + '"';
        if (calcUnitHidden) calcUnitHidden.value = '$' + unit.toFixed(2);
        if (calcTotalHidden) calcTotalHidden.value = '$' + total.toFixed(2);
        if (calcCustomPriceHidden) calcCustomPriceHidden.value = unit.toFixed(2);
        if (calcQuoteTokenHidden) calcQuoteTokenHidden.value = '';
        renderTierTable(sizeValue, qty);
        updatePreviewDimensions(w, h);
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
        if (calcCustomPriceHidden) calcCustomPriceHidden.value = unit.toFixed(2);
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
              productType: productType,
              productHandle: productHandle,
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

      function tokenize(name) {
        var stop = {
          patch: true,
          patches: true,
          custom: true,
          and: true,
          the: true
        };
        return normalize(name)
          .split(' ')
          .filter(function (t) {
            return t && !stop[t];
          });
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
            var allRows = rows || [];
            var normalizedProduct = normalize(productName);
            var normalizedType = normalize(productType);
            var productTokens = tokenize(productName);
            var groups = {};

            allRows.forEach(function (row) {
              var key = normalize(row.name);
              if (!key) return;
              if (!groups[key]) {
                groups[key] = {
                  key: key,
                  name: row.name,
                  rows: [],
                  score: 0
                };
              }
              groups[key].rows.push(row);
            });

            // Highest confidence: exact match to product type, then product title.
            if (normalizedType && groups[normalizedType]) {
              pricingRows = groups[normalizedType].rows;
              pricingReady = true;
              updateSizer();
              return;
            }
            if (normalizedProduct && groups[normalizedProduct]) {
              pricingRows = groups[normalizedProduct].rows;
              pricingReady = true;
              updateSizer();
              return;
            }

            Object.keys(groups).forEach(function (key) {
              var group = groups[key];
              var score = 0;
              if (key === normalizedProduct) {
                score += 1000;
              } else if (
                includesWords(group.name, productName) ||
                includesWords(productName, group.name)
              ) {
                score += 500;
              }

              var nameTokens = tokenize(group.name);
              var overlap = 0;
              for (var i = 0; i < productTokens.length; i++) {
                if (nameTokens.indexOf(productTokens[i]) !== -1) overlap += 1;
              }
              score += overlap * 25;
              group.score = score;
            });

            var best = null;
            Object.keys(groups).forEach(function (key) {
              var group = groups[key];
              if (!best || group.score > best.score) best = group;
            });

            if (best && best.score > 0) {
              pricingRows = best.rows;
            } else {
              // No confident product-name match; keep empty so fallback pricing rules apply.
              pricingRows = [];
            }
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
