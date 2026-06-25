/* =============================================================
   Ambient "craft artifacts" background — v3.
   Renders TWO artifacts at a time (one on small screens), cycling a
   playlist of DSA and Angular scenes:
     1) DSA:     binary tree   +  sorting bars
     2) DSA:     linked list   +  stack
     3) Angular: signal() code  →  live counter component
     4) Angular: reactive-form code  →  live input component
   Theme-aware, faint-but-visible, performant, reduced-motion safe.
   ============================================================= */

(function () {
  "use strict";

  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  var SANS = "Inter, system-ui, sans-serif";
  var SCENE_MS = 13000, FADE = 1600, FRAME = 1000 / 30;

  var W = 0, H = 0, DPR = 1;
  var line = "#9b9ba3", accent = "#7c8cff";
  var clock = 0, sceneIndex = 0, last = 0, acc = 0;

  /* ---------- theme + sizing ---------- */
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    line = cs.getPropertyValue("--text-muted").trim() || "#9b9ba3";
    accent = cs.getPropertyValue("--accent").trim() || "#7c8cff";
  }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ---------- helpers ---------- */
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; }
  /* scene-progress window: 0 before `start`, ramps to 1 over `span` of the scene */
  function prog(start, span) { return clamp((clock - SCENE_MS*start) / (SCENE_MS*span), 0, 1); }
  function resetText() { ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; }
  function withAlpha(color, a) {
    if (color[0] === "#") {
      var h = color.slice(1);
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var n = parseInt(h, 16);
      return "rgba(" + ((n>>16)&255) + "," + ((n>>8)&255) + "," + (n&255) + "," + a + ")";
    }
    return color.replace(/rgba?\(([^)]+)\)/, function (_, inner) {
      var p = inner.split(",").slice(0, 3).map(function (s) { return s.trim(); });
      return "rgba(" + p.join(",") + "," + a + ")";
    });
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
  }

  /* =================== DSA artifacts =================== */

  function artTree(z, a) {
    var vals = [8,4,12,2,6,10,14], LEV = 3;
    var tw = z.w * 0.84, th = z.h * 0.6, topY = z.y + z.h * 0.18, cx = z.x + z.w / 2;
    var nr = Math.max(10, Math.min(z.w, z.h) * 0.072);
    var pts = [];
    for (var i = 0; i < 7; i++) {
      var d = Math.floor(Math.log(i + 1) / Math.LN2), c = 1 << d, j = i - (c - 1);
      pts.push({ x: cx - tw/2 + (j + 0.5) * (tw / c), y: topY + d * (th / (LEV - 1)), v: vals[i] });
    }
    // light nodes in IN-ORDER sequence (matches the inorder() code)
    var INORDER = [3,1,4,0,5,2,6], rank = [];
    for (i = 0; i < 7; i++) rank[INORDER[i]] = i;
    var litN = prog(0.2, 0.65) * 7.2;   // how many nodes visited so far
    for (i = 1; i < 7; i++) {
      var p = pts[(i-1)>>1], q = pts[i], on = rank[i] < litN;
      ctx.lineWidth = on ? 1.8 : 1.3;
      ctx.strokeStyle = on ? withAlpha(accent, 0.85*a) : withAlpha(line, 0.32*a);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    }
    ctx.font = "600 " + Math.round(nr*0.95) + "px " + MONO;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (i = 0; i < 7; i++) {
      var n = pts[i], on2 = rank[i] < litN;
      ctx.lineWidth = 1.6;
      ctx.fillStyle = on2 ? withAlpha(accent, 0.15*a) : withAlpha(line, 0.06*a);
      ctx.strokeStyle = on2 ? withAlpha(accent, 0.9*a) : withAlpha(line, 0.42*a);
      ctx.beginPath(); ctx.arc(n.x, n.y, nr, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = on2 ? withAlpha(accent, 0.95*a) : withAlpha(line, 0.6*a);
      ctx.fillText(String(n.v), n.x, n.y + 0.5);
    }
    resetText();
  }

  var sortSteps = null;
  function getSortSteps() {
    if (sortSteps) return sortSteps;
    var arr = [5,2,8,1,7,3,6,4], s = [{ a: arr.slice(), i: -1, j: -1 }];
    for (var i = 0; i < arr.length; i++) {
      var m = i;
      for (var j = i+1; j < arr.length; j++) if (arr[j] < arr[m]) m = j;
      if (m !== i) { var t = arr[i]; arr[i] = arr[m]; arr[m] = t; }
      s.push({ a: arr.slice(), i: i, j: m });
    }
    sortSteps = s; return s;
  }
  function artSort(z, a) {
    var steps = getSortSteps(), N = 8;
    var idx = Math.min(steps.length - 1, Math.floor(prog(0.18, 0.72) * steps.length));
    var st = steps[idx];
    var slotW = z.w * 0.9 / N, barW = slotW * 0.58, x0 = z.x + z.w * 0.05;
    var baseY = z.y + z.h * 0.8, maxH = z.h * 0.62;
    for (var k = 0; k < N; k++) {
      var h = (st.a[k] / 8) * maxH, bx = x0 + k*slotW + (slotW - barW)/2;
      var on = (k === st.i || k === st.j);
      ctx.fillStyle = on ? withAlpha(accent, 0.85*a) : withAlpha(line, 0.3*a);
      roundRect(bx, baseY - h, barW, h, 2); ctx.fill();
    }
  }

  function artList(z, a) {
    var vals = [3,7,1,9], n = 4;
    var boxW = z.w * 0.16, boxH = boxW * 0.84, gap = z.w * 0.085;
    var totalW = n*boxW + (n-1)*gap + boxW*0.7;
    var x0 = z.x + (z.w - totalW)/2, y = z.y + z.h/2 - boxH/2;
    var cur = Math.min(n - 1, Math.floor(prog(0.2, 0.7) * n));
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var fs = Math.round(boxH*0.42);
    for (var i = 0; i < n; i++) {
      var bx = x0 + i*(boxW + gap), on = i === cur;
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = on ? withAlpha(accent, 0.9*a) : withAlpha(line, 0.45*a);
      ctx.fillStyle = on ? withAlpha(accent, 0.14*a) : withAlpha(line, 0.05*a);
      roundRect(bx, y, boxW, boxH, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = on ? withAlpha(accent, 0.95*a) : withAlpha(line, 0.62*a);
      ctx.font = "600 " + fs + "px " + MONO;
      ctx.fillText(String(vals[i]), bx + boxW/2, y + boxH/2);
      var ax1 = bx + boxW, ax2 = bx + boxW + gap, ay = y + boxH/2;
      ctx.strokeStyle = withAlpha(line, 0.42*a); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(ax1 + 2, ay); ctx.lineTo(ax2 - 4, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax2 - 4, ay); ctx.lineTo(ax2 - 9, ay - 3);
      ctx.moveTo(ax2 - 4, ay); ctx.lineTo(ax2 - 9, ay + 3); ctx.stroke();
    }
    var lastX = x0 + (n-1)*(boxW + gap) + boxW;
    ctx.fillStyle = withAlpha(line, 0.5*a); ctx.font = Math.round(boxH*0.5) + "px " + MONO;
    ctx.fillText("∅", lastX + gap*0.9, y + boxH/2);
    resetText();
  }

  var BS_ARR = [2,5,8,11,14,17,21,25], BS_TARGET = 21;
  var bsSteps = null;
  function getBSearchSteps() {
    if (bsSteps) return bsSteps;
    var lo = 0, hi = BS_ARR.length - 1, s = [];
    while (lo <= hi) {
      var mid = (lo + hi) >> 1, found = BS_ARR[mid] === BS_TARGET;
      s.push({ lo: lo, hi: hi, mid: mid, found: found });
      if (found) break;
      if (BS_ARR[mid] < BS_TARGET) lo = mid + 1; else hi = mid - 1;
    }
    bsSteps = s; return s;
  }
  function artBSearch(z, a) {
    var steps = getBSearchSteps(), N = BS_ARR.length;
    var idx = Math.min(steps.length - 1, Math.floor(prog(0.25, 0.6) * steps.length));
    var st = steps[idx];
    var slotW = z.w * 0.92 / N, boxW = slotW * 0.84, boxH = boxW * 0.92;
    var x0 = z.x + z.w * 0.04, y = z.y + z.h * 0.42 - boxH / 2;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var fs = Math.round(boxH * 0.4);
    for (var k = 0; k < N; k++) {
      var bx = x0 + k * slotW + (slotW - boxW) / 2;
      var inWin = k >= st.lo && k <= st.hi, isMid = k === st.mid;
      ctx.lineWidth = 1.5;
      if (isMid) {
        ctx.strokeStyle = withAlpha(st.found ? "#34c759" : accent, 0.95 * a);
        ctx.fillStyle = withAlpha(st.found ? "#34c759" : accent, 0.16 * a);
      } else {
        ctx.strokeStyle = withAlpha(line, (inWin ? 0.5 : 0.18) * a);
        ctx.fillStyle = withAlpha(line, (inWin ? 0.06 : 0.02) * a);
      }
      roundRect(bx, y, boxW, boxH, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = isMid ? withAlpha(st.found ? "#34c759" : accent, 0.95 * a)
                            : withAlpha(line, (inWin ? 0.7 : 0.28) * a);
      ctx.font = "600 " + fs + "px " + MONO;
      ctx.fillText(String(BS_ARR[k]), bx + boxW / 2, y + boxH / 2);
    }
    // lo / mid / hi pointer labels under their boxes
    var lfs = Math.round(boxH * 0.34);
    ctx.font = lfs + "px " + MONO;
    function tag(label, col, idxBox) {
      var bx = x0 + idxBox * slotW + slotW / 2;
      ctx.fillStyle = withAlpha(col, 0.8 * a);
      ctx.fillText(label, bx, y + boxH + lfs * 1.3);
    }
    tag("lo", line, st.lo); tag("hi", line, st.hi); tag("mid", accent, st.mid);
    // target caption
    ctx.fillStyle = withAlpha(line, 0.5 * a); ctx.font = Math.round(z.h * 0.05) + "px " + MONO;
    ctx.fillText("target = " + BS_TARGET, z.x + z.w / 2, y - boxH * 0.7);
    resetText();
  }

  /* =================== Angular: code + live component =================== */

  function drawCode(z, a, lines, typedFrac) {
    var fs = clamp(z.w * 0.034, 11, 15);
    ctx.font = fs + "px " + MONO; ctx.textBaseline = "top"; ctx.textAlign = "left";
    var lineH = fs * 1.7;
    var total = lines.join("\n").length;
    var typed = Math.floor(typedFrac * total);
    var bx = z.x + z.w * 0.06, by = z.y + (z.h - lines.length * lineH) / 2;
    var seen = 0, caretX = bx, caretY = by;
    ctx.fillStyle = withAlpha(line, 0.62 * a);
    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i], show = Math.max(0, Math.min(ln.length, typed - seen));
      if (show > 0) ctx.fillText(ln.slice(0, show), bx, by + i*lineH);
      if (seen <= typed && typed < seen + ln.length + 1) {
        caretX = bx + ctx.measureText(ln.slice(0, show)).width; caretY = by + i*lineH;
      }
      seen += ln.length + 1;
    }
    if (typedFrac < 1 && (Math.floor(clock / 500) % 2) === 0) {
      ctx.fillStyle = withAlpha(accent, 0.9 * a);
      ctx.fillRect(caretX + 1, caretY, 2, fs);
    }
    resetText();
  }

  function codeFrac() { return clamp(clock / (SCENE_MS * 0.55), 0, 1); }

  /* ---------- DSA code blocks (paired with the visuals) ---------- */
  var SORT_CODE = [
    "for (i = 0; i < n; i++) {",
    "  let m = i;",
    "  for (j = i+1; j < n; j++)",
    "    if (a[j] < a[m]) m = j;",
    "  swap(a, i, m);",
    "}"
  ];
  var BSEARCH_CODE = [
    "let lo = 0, hi = n - 1;",
    "while (lo <= hi) {",
    "  let mid = (lo+hi) >> 1;",
    "  if (a[mid] === x)",
    "    return mid;",
    "  a[mid] < x",
    "    ? lo = mid + 1",
    "    : hi = mid - 1;",
    "}"
  ];
  var TREE_CODE = [
    "inorder(node) {",
    "  if (!node) return;",
    "  inorder(node.left);",
    "  visit(node.val);",
    "  inorder(node.right);",
    "}"
  ];
  var LIST_CODE = [
    "let node = head;",
    "while (node) {",
    "  visit(node.val);",
    "  node = node.next;",
    "}"
  ];
  function dsaSortCode(z, a)    { drawCode(z, a, SORT_CODE, codeFrac()); }
  function dsaBSearchCode(z, a) { drawCode(z, a, BSEARCH_CODE, codeFrac()); }
  function dsaTreeCode(z, a)    { drawCode(z, a, TREE_CODE, codeFrac()); }
  function dsaListCode(z, a)    { drawCode(z, a, LIST_CODE, codeFrac()); }

  var SIGNAL_CODE = [
    "count = signal(0);",
    "",
    "inc() {",
    "  this.count",
    "    .update(c => c + 1);",
    "}"
  ];
  function ngSignalCode(z, a) { drawCode(z, a, SIGNAL_CODE, codeFrac()); }
  function ngSignalComp(z, a) {
    var cx = z.x + z.w/2, cy = z.y + z.h/2;
    var phase2 = Math.max(0, clock - SCENE_MS * 0.5);
    var val = Math.min(6, Math.floor(phase2 / 650));
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    // label
    ctx.fillStyle = withAlpha(line, 0.45*a); ctx.font = Math.round(z.h*0.05) + "px " + MONO;
    ctx.fillText("count()", cx, cy - z.h*0.27);
    // big number
    ctx.fillStyle = withAlpha(accent, 0.92*a); ctx.font = "700 " + Math.round(z.h*0.24) + "px " + SANS;
    ctx.fillText(String(val), cx, cy - z.h*0.08);
    // button
    var bw = z.w*0.34, bh = z.h*0.17, bx = cx - bw/2, by = cy + z.h*0.1;
    var sinceInc = phase2 - val*650;
    roundRect(bx, by, bw, bh, bh/2);
    if (val > 0 && sinceInc < 260) { ctx.fillStyle = withAlpha(accent, 0.2*(1 - sinceInc/260)*a); ctx.fill(); }
    ctx.lineWidth = 1.6; ctx.strokeStyle = withAlpha(line, 0.5*a); ctx.stroke();
    ctx.fillStyle = withAlpha(line, 0.62*a); ctx.font = "600 " + Math.round(bh*0.46) + "px " + MONO;
    ctx.fillText("+1", cx, by + bh/2);
    resetText();
  }

  var FORM_CODE = [
    "form = new FormGroup({",
    "  email: new FormControl(",
    "    '', [Validators.email]",
    "  ),",
    "});"
  ];
  function ngFormCode(z, a) { drawCode(z, a, FORM_CODE, codeFrac()); }
  function ngFormComp(z, a) {
    var cx = z.x + z.w/2, cy = z.y + z.h/2;
    var fw = z.w*0.66, fh = z.h*0.17, fx = cx - fw/2, fy = cy - fh/2;
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = withAlpha(line, 0.5*a); ctx.font = Math.round(z.h*0.052) + "px " + MONO;
    ctx.fillText("Email", fx, fy - z.h*0.045);
    ctx.lineWidth = 1.6; ctx.strokeStyle = withAlpha(accent, 0.55*a);
    roundRect(fx, fy, fw, fh, 8); ctx.fillStyle = withAlpha(accent, 0.05*a); ctx.fill(); ctx.stroke();
    var tf = clamp((clock - SCENE_MS*0.3) / (SCENE_MS*0.4), 0, 1);
    var email = "yash@ghori.in", shown = email.slice(0, Math.floor(tf * email.length));
    ctx.fillStyle = withAlpha(line, 0.72*a); ctx.font = Math.round(fh*0.42) + "px " + MONO; ctx.textBaseline = "middle";
    ctx.fillText(shown, fx + 12, fy + fh/2);
    if (tf < 1 && (Math.floor(clock / 500) % 2) === 0) {
      var w = ctx.measureText(shown).width;
      ctx.fillStyle = withAlpha(accent, 0.8*a); ctx.fillRect(fx + 12 + w + 1, fy + fh*0.27, 1.5, fh*0.46);
    }
    if (tf >= 1) {
      ctx.strokeStyle = withAlpha("#34c759", 0.9*a); ctx.lineWidth = 2;
      var ckx = fx + fw - 20, cky = fy + fh/2;
      ctx.beginPath(); ctx.moveTo(ckx - 4, cky); ctx.lineTo(ckx - 1, cky + 4); ctx.lineTo(ckx + 5, cky - 5); ctx.stroke();
    }
    resetText();
  }

  /* ---------- "code → component" arrow on Angular scenes ---------- */
  function drawArrow(zl, zr, a) {
    var y = zl.y + zl.h/2, mid1 = zl.x + zl.w, mid2 = zr.x;
    var gx1 = mid1 + (mid2 - mid1)*0.25, gx2 = mid2 - (mid2 - mid1)*0.25;
    ctx.strokeStyle = withAlpha(accent, 0.4*a); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(gx1, y); ctx.lineTo(gx2, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx2, y); ctx.lineTo(gx2 - 7, y - 4);
    ctx.moveTo(gx2, y); ctx.lineTo(gx2 - 7, y + 4); ctx.stroke();
  }

  /* =================== playlist + manager =================== */
  var SCENES = [
    { left: dsaSortCode,    right: artSort,      mobile: artSort,      pair: true },
    { left: dsaBSearchCode, right: artBSearch,   mobile: artBSearch,   pair: true },
    { left: dsaTreeCode,    right: artTree,      mobile: artTree,      pair: true },
    { left: dsaListCode,    right: artList,      mobile: artList,      pair: true },
    { left: ngSignalCode,   right: ngSignalComp, mobile: ngSignalComp, pair: true },
    { left: ngFormCode,     right: ngFormComp,   mobile: ngFormComp,   pair: true }
  ];

  function sceneAlpha() {
    if (clock < FADE) return easeInOut(clock / FADE);
    if (clock > SCENE_MS - FADE) return easeInOut((SCENE_MS - clock) / FADE);
    return 1;
  }
  function zones() {
    if (W < 900) {
      var zw = Math.min(W*0.82, 420), zh = Math.min(H*0.46, 300);
      return { single: { x: W/2 - zw/2, y: H*0.5 - zh/2, w: zw, h: zh } };
    }
    var zw2 = Math.min(W*0.40, 440), zh2 = Math.min(H*0.52, 360), gap = Math.min(W*0.05, 64);
    var x0 = Math.max(W*0.04, W/2 - (zw2*2 + gap)/2), y = H*0.5 - zh2/2;
    return { left: { x: x0, y: y, w: zw2, h: zh2 }, right: { x: x0 + zw2 + gap, y: y, w: zw2, h: zh2 } };
  }
  function render(a) {
    ctx.clearRect(0, 0, W, H);
    var sc = SCENES[sceneIndex], z = zones();
    if (z.single) { (sc.mobile || sc.left)(z.single, a); }
    else { sc.left(z.left, a); sc.right(z.right, a); if (sc.pair) drawArrow(z.left, z.right, a); }
  }
  function frame(ts) {
    if (document.hidden) { last = ts; requestAnimationFrame(frame); return; }
    if (!last) last = ts;
    var dt = ts - last; last = ts; acc += dt;
    if (acc >= FRAME) {
      clock += acc; acc = 0;
      if (clock >= SCENE_MS) { clock = 0; sceneIndex = (sceneIndex + 1) % SCENES.length; }
      render(sceneAlpha());
    }
    requestAnimationFrame(frame);
  }

  /* ---------- init ---------- */
  readColors();
  resize();
  var rT;
  window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(resize, 180); });
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  if (reduceMotion) { clock = 4500; render(1); return; }
  requestAnimationFrame(frame);
})();
