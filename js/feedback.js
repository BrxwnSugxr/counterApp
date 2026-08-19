// ============ TOAST, ANNOUNCE & VIBRATE ============
import { els } from "./dom.js";

export function showToast(text, actionLabel, actionFn) {
  els.toast.innerHTML = "";
  els.toast.appendChild(document.createTextNode(text));
  if (actionLabel) {
    const a = document.createElement("span");
    a.className = "toast-action";
    a.textContent = actionLabel;
    a.addEventListener("click", function (e) {
      e.stopPropagation();
      if (actionFn) actionFn();
      els.toast.classList.remove("show");
    });
    els.toast.appendChild(a);
  }
  els.toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(
    function () {
      els.toast.classList.remove("show");
    },
    actionLabel ? 4000 : 1300,
  );
}

export function announce(text) {
  els.liveRegion.textContent = text;
}

export function vibrate(pattern) {
  if (navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}
