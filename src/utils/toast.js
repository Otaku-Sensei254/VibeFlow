export function showToast({ type = "success", title, message, link, linkText, duration = 5000 }) {
  window.dispatchEvent(new CustomEvent("app:toast", {
    detail: { id: Date.now() + Math.random(), type, title, message, link, linkText, duration }
  }));
}
