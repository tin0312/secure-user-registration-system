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
  item.classList.toggle("text-isValid", passed);
  item.classList.toggle("text-error", !passed);
}

function updateFieldValidation(fieldName, isValid) {
  if (fields[fieldName] !== isValid) {
    fields[fieldName] = isValid;
    updateSubmitBtnState();
  }
}

function isPasswordValid(password, checklist, helper, input) {
  const results = Object.entries(passwordCriteria).map(([key, test]) => [key, test(password)]);
  results.forEach(([key, passed]) => updateChecklistItem(`check-${key}`, passed));
  const isValid = results.every(([, passed]) => passed);
  updateFieldValidation("password", isValid);
  if (helper?.firstChild) {
    helper.firstChild.textContent = isValid ? "Password is strong." : "Password must meet all criteria:";
  }

  helper?.classList.toggle("text-valid", isValid);
  checklist?.classList.toggle("hidden", isValid);
  input?.classList.toggle("input-error", !isValid);

  return isValid;
}

function showInputFeedback(id, isValid, message) {
  const feedback = document.getElementById(`${id}-feedback`);
  if (!feedback) return;
  feedback.textContent = isValid ? "" : message;
  feedback.classList.toggle("text-error", !isValid);

}


function isUsernameValidated(value) {
  const trimmed = value.trim();
  const isValid = /^[a-zA-Z0-9_]{3,50}$/.test(trimmed);
  updateFieldValidation("username", isValid);
  showInputFeedback("username", isValid, "Username must be 3–50 characters long and contain only letters, numbers, or underscores.");
  return isValid;
}

function isEmailValidated(value) {
  const trimmed = value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  updateFieldValidation("email", isValid);
  showInputFeedback("email", isValid, "Enter a isValid email address.");
  return isValid;
}

function isPhoneNumberValidated(value) {
  const trimmed = value.trim();
  const digitsOnly = trimmed.replace(/\D/g, "");
  phoneNumber.value = digitsOnly;
  const isValid = digitsOnly.length >= 7 && digitsOnly.length <= 20;
  updateFieldValidation("phone-number", isValid);
  showInputFeedback("phone-number", isValid, "Phone number should be 7-20 long");
  return isValid;
}

function isFullNameValidated(value) {
  const trimmed = value.trim();
  const isValid = trimmed.length >= 2 && /^[A-Za-z\s'-]+$/.test(trimmed);
  updateFieldValidation("full-name", isValid);
  showInputFeedback("full-name", isValid, "Name must be at least 2 characters and contain only letters, spaces, apostrophes, or hyphens.");
  return isValid;
}

function isPersonTitleValidated(value) {
  const trimmed = value.trim();
  const isValid = /^[A-Za-z\s'-]+$/.test(trimmed);
  updateFieldValidation("person-title", isValid);
  showInputFeedback("person-title", isValid, "Person title must contain only letters, spaces, apostrophes, or hyphens.");
  return isValid;
}
