(function () {
  "use strict";

  // The FleetConnect server that receives the contact form and launch sign-ups.
  var API = "https://newapi.fleetconnect.biz";

  /* ---- tabs: Riders / Drivers / Taxi companies / Businesses ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function showTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) { p.hidden = !on; p.classList.toggle("on", on); }
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { showTab(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") n = tabs[(i + tabs.length - 1) % tabs.length];
      else if (e.key === "Home") n = tabs[0];
      else if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); showTab(n, true); }
    });
  });

  /* ---- the countdown on the example driver screen (same loop as the ring) ---- */
  var count = document.getElementById("count");
  if (count && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var left = 24;
    setInterval(function () {
      left = left <= 0 ? 24 : left - 1;
      count.textContent = "0:" + (left < 10 ? "0" : "") + left;
    }, 1000);
  } else if (count) {
    count.textContent = "1:48";
  }

  /* ---- sending forms to the server ---- */
  function post(path, body) {
    return fetch(API + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { status: res.status, data: data };
      });
    });
  }
  function say(el, text, ok) {
    el.textContent = text;
    el.className = "msg " + (ok ? "ok" : "err");
  }
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
  var fail = "We could not send that just now. Please try again, or email info@fleetconnect.biz.";

  var launch = document.getElementById("launch-form");
  if (launch) {
    launch.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = document.getElementById("launch-msg");
      var email = launch.elements.email.value.trim();
      if (!emailOk(email)) { say(msg, "Please enter a valid email address.", false); return; }
      var btn = launch.querySelector("button"); btn.disabled = true;
      post("/api/public/launch/subscribe", { email: email }).then(function (r) {
        if (r.status === 201) { say(msg, "Thank you. We will email you when FleetConnect launches.", true); launch.reset(); }
        else if (r.status === 429) say(msg, "Too many tries. Please wait a few minutes and try again.", false);
        else say(msg, (r.data && r.data.message) || fail, false);
      }).catch(function () { say(msg, fail, false); }).then(function () { btn.disabled = false; });
    });
  }

  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = document.getElementById("contact-msg");
      var f = form.elements;
      var body = {
        name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
        subject: f.subject.value, message: f.message.value.trim(), website: f.website.value
      };
      if (!body.name) { say(msg, "Please enter your name.", false); f.name.focus(); return; }
      if (!emailOk(body.email)) { say(msg, "Please enter a valid email address.", false); f.email.focus(); return; }
      if (!body.message) { say(msg, "Please write a message.", false); f.message.focus(); return; }
      var btn = document.getElementById("contact-btn"); btn.disabled = true;
      post("/api/public/contact", body).then(function (r) {
        if (r.status === 201) { say(msg, "Thank you. We have your message and will reply by email. A confirmation is on its way to you.", true); form.reset(); }
        else if (r.status === 429) say(msg, "Too many messages in a short time. Please wait a few minutes and try again.", false);
        else say(msg, (r.data && r.data.message) || fail, false);
      }).catch(function () { say(msg, fail, false); }).then(function () { btn.disabled = false; });
    });
  }
})();
