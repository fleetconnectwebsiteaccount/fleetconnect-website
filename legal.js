(function () {
  "use strict";
  var API = "https://newapi.fleetconnect.biz";
  var kind = document.body.getAttribute("data-kind"); // terms | privacy | faq
  var out = document.getElementById("legal-out");
  var segs = Array.prototype.slice.call(document.querySelectorAll("[data-aud]"));
  var audience = "RIDER";

  function clear() { while (out.firstChild) out.removeChild(out.firstChild); }
  function text(t, cls) { clear(); var d = document.createElement("div"); d.className = "legal-body " + (cls || ""); d.textContent = t; out.appendChild(d); }
  function pick(data) {
    // The server answers with the text for this audience. Accept a plain string, or an object with a field per kind.
    if (data == null) return "";
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data;
    var keys = { terms: ["terms", "termsConditions", "text"], privacy: ["privacy", "privacyPolicy", "text"], faq: ["faq", "faqs", "text"] }[kind];
    for (var i = 0; i < keys.length; i++) {
      var v = data[keys[i]];
      if (v == null) continue;
      if (typeof v === "string" || Array.isArray(v)) return v;
      if (v && typeof v.text === "string") return v.text;
    }
    return data.data !== undefined ? pick(data.data) : "";
  }
  function show(content) {
    if (Array.isArray(content) && content.length) {
      clear();
      content.forEach(function (item) {
        var box = document.createElement("div"); box.className = "faq-item";
        var h = document.createElement("h3"); h.textContent = String(item.question || "");
        var p = document.createElement("div"); p.className = "legal-body"; p.textContent = String(item.answer || "");
        box.appendChild(h); box.appendChild(p); out.appendChild(box);
      });
      return;
    }
    var s = typeof content === "string" ? content.trim() : "";
    if (s) text(s);
    else text("This page has not been published yet. For questions, email info@fleetconnect.biz.", "empty");
  }
  function load() {
    text("Loading…", "empty");
    fetch(API + "/api/public/legal?audience=" + audience, { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("bad"); return r.json(); })
      .then(function (j) { show(pick(j)); })
      .catch(function () { text("We could not load this page just now. Please try again later, or email info@fleetconnect.biz.", "empty"); });
  }
  segs.forEach(function (b) {
    b.addEventListener("click", function () {
      audience = b.getAttribute("data-aud");
      segs.forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      load();
    });
  });
  load();
})();
