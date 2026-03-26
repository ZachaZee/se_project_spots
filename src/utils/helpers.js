export function setButtonText(button, isLoading, loadingText = "Saving...") {
  if (isLoading) {
    // Store original text to revert back later
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
  } else {
    // Revert to original text
    button.textContent = button.dataset.originalText || "Save";
  }
}
