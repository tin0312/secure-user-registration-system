// Password strength rules
const passwordCriteria = {
  length: (pw) => pw.length >= 8,
  lower: (pw) => /[a-z]/.test(pw),
  upper: (pw) => /[A-Z]/.test(pw),
  number: (pw) => /[0-9]/.test(pw),
  special: (pw) => /[^a-zA-Z0-9]/.test(pw),
};

function updateChecklistItem(id, passed) {
  const item = document.getElementById(id);
  if (!item) return;
  item.textContent = (passed ? "✅" : "❌") + " " + item.textContent.slice(2);
  item.classList.toggle("text-valid", passed);
  item.classList.toggle("text-error", !passed);
}

function isPasswordValid(password, checklist, helper, input) {
  const results = Object.entries(passwordCriteria).map(([key, test]) => [key, test(password)]);
  results.forEach(([key, passed]) => updateChecklistItem(`check-${key}`, passed));

  const isValid = results.every(([, passed]) => passed);

  if (helper?.firstChild) {
    helper.firstChild.textContent = isValid ? "Password is strong." : "Password must meet all criteria:";
  }

  helper?.classList.toggle("text-valid", isValid);
  checklist?.classList.toggle("hidden", isValid);
  input?.classList.toggle("input-error", !isValid);

  return isValid;
}

function showInputFeedback(id, valid, message) {
  const feedback = document.getElementById(`${id}-feedback`);
  if (!feedback) return;
  feedback.textContent = valid ? "" : message;
  feedback.classList.toggle("text-error", !valid);
}

function isUsernameValidated(value) {
  const trimmed = value.trim();
  const valid = /^[a-zA-Z0-9_]{3,50}$/.test(trimmed);
  showInputFeedback("username", valid, "Username must be 3–50 characters long and contain only letters, numbers, or underscores.");
  return valid;
}

function isEmailValidated(value) {
  const trimmed = value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  showInputFeedback("email", valid, "Enter a valid email address.");
  return valid;
}

function isPhoneNumberValidated(value) {
  const trimmed = value.trim();
  const valid = /^\+?[0-9\s\-()]{7,20}$/.test(trimmed);
  showInputFeedback("phone-number", valid, "Enter a valid phone number.");
  return valid;
}

function isFullNameValidated(value) {
  const trimmed = value.trim();
  const valid = trimmed.length >= 2 && /^[A-Za-z\s'-]+$/.test(trimmed);
  showInputFeedback("full-name", valid, "Name must be at least 2 characters and contain only letters, spaces, apostrophes, or hyphens.");
  return valid;
}

function validatePersonTitle(value) {
  const trimmed = value.trim();
  const valid = /^[A-Za-z\s'-]+$/.test(trimmed);
  showInputFeedback("person-title", valid, "Person title must contain only letters, spaces, apostrophes, or hyphens.");
  return valid;
}
