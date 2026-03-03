function setUniqueValue() {
  const ns = document.getElementById("UniqueValueInput").value.trim();
  if (!ns) return;

  // Save values
  localStorage.setItem("uniquevalue", ns);

  updateUniqueValue();
}

function updateUniqueValue() {
  // Get stored namespace (null if not set)
  const ns = localStorage.getItem("uniquevalue");

  // Update variables display
  const nsDisplay = document.getElementById("currentValue");
  if (nsDisplay) {
    nsDisplay.innerText = ns || "<your-value>";
  }

  // Do nothing if namespace is not set
  if (!ns) return;

  // Replace placeholders across the page
  document.querySelectorAll("code, pre, td, p, span").forEach(el => {
    el.innerHTML = el.innerHTML
      .replace(/&lt;your-value&gt;/g, ns)
      .replace(/<your-value>/g, ns);
  });
}

// Run when page loads
window.addEventListener("DOMContentLoaded", updateUniqueValue);
