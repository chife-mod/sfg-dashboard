/**
 * Launcher renderer — Vsevolod shared dashboard base.
 *
 * Renders a whole per-project launcher from window.PREVIEW_CONFIG so the
 * dashboard CHROME lives in exactly ONE place. A subproject's index.html is
 * just the config + <link>/<script> tags pointing at this base — there is no
 * per-project chrome to copy or drift.
 *
 *   window.PREVIEW_CONFIG = {
 *     project:  "Reply Anywhere",                       // pill header + <title>
 *     eyebrow:  "Internal Preview",                     // optional
 *     title:    "Reply Anywhere · Design Dashboard",    // h1
 *     previewsTitle: "Previews",                        // optional section label
 *     previews: [ { tag, title, desc, href, status, cta } ],
 *     docsTitle: "Documentation",                       // optional
 *     docs:     [ { label, sub, href, icon, external } ],
 *     stagesTitle: "Project stages",                    // optional
 *     stages:   [ { name, status, progress, label } ],  // status: done|active|pending
 *     meta:     [ { dt, dd } | { dt, label, href } ],
 *     versions: [ { id, label, desc, path } ]           // for the nav pill
 *   };
 *
 * NEVER add a logo here — header is eyebrow + title only (studio rule).
 */
(function () {
  "use strict";

  var C = window.PREVIEW_CONFIG || {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  if (C.project) document.title = esc(C.project) + " — Preview Dashboard";

  /* ── Resource-card icons ── */
  var ICONS = {
    doc:
      '<path d="M7 4h7l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M14 4v5h5M9 13h8M9 17h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    globe:
      '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" stroke="currentColor" stroke-width="1.5"/>',
    chat:
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    repo:
      '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" fill="currentColor"/>',
    link:
      '<path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  function iconSvg(name) {
    var body = ICONS[name] || ICONS.doc;
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' + body + "</svg>";
  }

  function previewCard(v) {
    var planned = v.status === "planned";
    var href = planned ? "#" : (v.href || "#");
    var cta = v.cta || (planned ? "Soon" : "Open");
    return (
      '<a class="version-card"' + (planned ? ' data-status="planned"' : "") + ' href="' + esc(href) + '">' +
      '<span class="version-card__tag">' + esc(v.tag || "") + "</span>" +
      '<h2 class="version-card__title">' + esc(v.title || "") + "</h2>" +
      '<p class="version-card__desc">' + esc(v.desc || "") + "</p>" +
      '<span class="version-card__cta">' + esc(cta) + "</span>" +
      "</a>"
    );
  }

  function docCard(d) {
    var ext = d.external || /^https?:\/\//.test(d.href || "");
    return (
      '<a class="resource-card"' + (d.status === "pending" ? ' data-status="pending"' : "") +
      ' href="' + esc(d.href || "#") + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" +
      '<span class="resource-card__icon" aria-hidden="true">' + iconSvg(d.icon) + "</span>" +
      '<span class="resource-card__body">' +
      '<span class="resource-card__label">' + esc(d.label || "") + "</span>" +
      '<span class="resource-card__sub">' + esc(d.sub || "") + "</span>" +
      "</span>" +
      '<span class="resource-card__arrow" aria-hidden="true">' + (ext ? "↗" : "→") + "</span>" +
      "</a>"
    );
  }

  function stageItem(s, i) {
    var n = ("0" + (i + 1)).slice(-2);
    var pct = (typeof s.progress === "number" ? s.progress : (s.status === "done" ? 100 : 0));
    return (
      '<li class="stage" data-status="' + esc(s.status || "pending") + '">' +
      '<div class="stage__index">' + n + "</div>" +
      '<div class="stage__name">' + esc(s.name || "") + "</div>" +
      '<div class="stage__progress"><span style="width: ' + pct + '%"></span></div>' +
      '<div class="stage__status">' + esc(s.label || "") + "</div>" +
      "</li>"
    );
  }

  function metaBlock(m) {
    var dd = m.href
      ? '<a href="' + esc(m.href) + '" target="_blank" rel="noopener">' + esc(m.label || m.dd || m.href) + "</a>"
      : esc(m.dd || "");
    return '<div class="launcher__meta-block"><dt>' + esc(m.dt || "") + "</dt><dd>" + dd + "</dd></div>";
  }

  function render() {
    var html = "";

    html +=
      '<header class="launcher__header">' +
      '<span class="launcher__eyebrow">' + esc(C.eyebrow || "Internal Preview") + "</span>" +
      '<h1 class="launcher__title">' + esc(C.title || C.project || "Design Dashboard") + "</h1>" +
      "</header>";

    if (C.previews && C.previews.length) {
      html += '<h2 class="launcher__section-title">' + esc(C.previewsTitle || "Previews") + "</h2>";
      html += '<div class="launcher__grid">' + C.previews.map(previewCard).join("") + "</div>";
    }

    if (C.docs && C.docs.length) {
      html += '<h2 class="launcher__section-title">' + esc(C.docsTitle || "Documentation") + "</h2>";
      html += '<div class="launcher__resources">' + C.docs.map(docCard).join("") + "</div>";
    }

    if (C.stages && C.stages.length) {
      html += '<h2 class="launcher__section-title">' + esc(C.stagesTitle || "Project stages") + "</h2>";
      html += '<ol class="stage-track" style="--stage-count: ' + C.stages.length + '">' +
        C.stages.map(stageItem).join("") + "</ol>";
    }

    if (C.meta && C.meta.length) {
      html += '<dl class="launcher__meta">' + C.meta.map(metaBlock).join("") + "</dl>";
    }

    var main = document.createElement("main");
    main.className = "launcher";
    main.innerHTML = html;
    document.body.insertBefore(main, document.body.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
