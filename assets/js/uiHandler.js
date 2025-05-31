// Elements
const accountTypes = document.getElementById("account-types");
const fullNameLabel = document.querySelector("label[for='full-name']");
const fullNameInput = document.getElementById("full-name");
const username = document.getElementById("username");
const email = document.getElementById("email");
const phoneNumber = document.getElementById("phone-number");
const passwordInput = document.getElementById("password");
const checklist = document.querySelector(".password-checklist");
const passwordHelper = document.getElementById("password-help");
const confirmPasswordInput = document.getElementById("confirm-password");
const confirmPasswordFeedback = document.getElementById("confirm-password-feedback");
const showPasswordToggle = document.getElementById("show-password");

const requiredMarker = document.querySelector(".required");
const inputFeedbackTemplate = document.querySelector(".input-feedback");
const fullNameFeedback = document.getElementById("full-name-feedback");

const personTitleLabel = document.createElement("label");
personTitleLabel.textContent = "Contact's Person Title";
personTitleLabel.setAttribute("for", "person-title");
personTitleLabel.appendChild(requiredMarker.cloneNode(true));
const personTitleFeedback = inputFeedbackTemplate.cloneNode(true);

const personTitleInput = document.createElement("input");
personTitleInput.setAttribute("id", "person-title");
personTitleInput.setAttribute("name", "person-title");
personTitleInput.setAttribute("required", "");
personTitleInput.classList.add("form-control");
personTitleFeedback.setAttribute("id", "person-title-feedback");

const fields = {
  "full-name": false,
  "username": false,
  "email": false,
  "phone-number": false,
  "password": false,
  "confirm-password": false
};

function resetFields() {
  Object.keys(fields).forEach(key => {
    fields[key] = false;
  });
}

function updateFullNameLabel(accountType) {
    fullNameLabel.textContent = accountType === "company" ? "Contact Name" : "Full Name";
    const existing = fullNameLabel.querySelector(".required");
    if (existing) existing.remove();
    fullNameLabel.appendChild(requiredMarker.cloneNode(true));
}

function togglePersonTitle(accountType) {
    if (accountType === "company") {
        if (!document.getElementById("person-title")) {
            fullNameFeedback.insertAdjacentElement("afterend", personTitleLabel);
            personTitleLabel.insertAdjacentElement("afterend", personTitleInput);
            personTitleInput.insertAdjacentElement("afterend", personTitleFeedback);
            personTitleInput.addEventListener("input", () => isPersonTitleValidated(personTitleInput.value));
        }
        fields["person-title"] = false;
    } else {
        personTitleLabel.remove();
        personTitleInput.remove();
        personTitleFeedback.remove();
        delete fields["person-title"];
    }
    updateSubmitBtnState()
}

function isPasswordMatched() {
    const isValid = passwordInput.value === confirmPasswordInput.value;
    confirmPasswordFeedback.textContent = isValid ? "" : "Passwords do not match.";
    confirmPasswordFeedback.classList.toggle("text-error", !isValid);
    confirmPasswordInput.classList.toggle("input-error", !isValid);
    if (fields["confirm-password"] !== isValid) {
    fields["confirm-password"] = isValid;
    updateSubmitBtnState();
  }
    return isValid;
}

function resetChecklist() {
    checklist.classList.remove("hidden");
    if (passwordHelper.firstChild) passwordHelper.firstChild.textContent = "";
    const items = checklist.querySelectorAll("li");
    items.forEach(item => {
        item.textContent = "❌ " + item.textContent.slice(2);
        item.classList.remove("text-valid", "text-error");
        item.classList.add("help-text");
    });
}

// Attach event listeners
accountTypes.addEventListener("change", () => {
    updateFullNameLabel(accountTypes.value);
    togglePersonTitle(accountTypes.value);
});

showPasswordToggle.addEventListener("change", () => {
    const type = showPasswordToggle.checked ? "text" : "password";
    passwordInput.type = type;
    confirmPasswordInput.type = type;
});

confirmPasswordInput.addEventListener("input", isPasswordMatched);

passwordInput.addEventListener("input", () =>
    isPasswordValid(passwordInput.value, checklist, passwordHelper, passwordHelper)
);
username.addEventListener("input", () => isUsernameValidated(username.value));
email.addEventListener("input", () => isEmailValidated(email.value));
phoneNumber.addEventListener("input", () => isPhoneNumberValidated(phoneNumber.value));
phoneNumber.addEventListener("blur", () => {
    phoneNumber.value = formatPhoneNumber(phoneNumber.value)
})
fullNameInput.addEventListener("input", () => isFullNameValidated(fullNameInput.value));


function formatPhoneNumber(phoneNumber) {
    const digits = phoneNumber.replace(/\D/g, "");
    const area = digits.slice(0, 3);
    const rest = digits.slice(3);
    if (digits.length === 10) {
        const part1 = rest.slice(0, 3);
        const part2 = rest.slice(3, 7);
        return `(${area}) ${part1}-${part2}`
    }
    return digits
}

function updateSubmitBtnState() {
  const allValid = Object.values(fields).every(Boolean);
  const submitButton = document.querySelector("button[type='submit']");
  submitButton.disabled = !allValid;
  submitButton.setAttribute("aria-disabled", !allValid);
}


function collectFormData() {
    const data = {
        username: username.value.trim(),
        email: email.value.trim(),
        phoneNumber: phoneNumber.value.trim().replace(/\D/g, ''),
        accountType: accountTypes.value,
        fullName: fullNameInput.value.trim(),
        password: passwordInput.value.trim()
    };
    const personTitleElement = document.getElementById("person-title");
    if (personTitleElement) {
        data.personTitle = personTitleElement.value.trim();
    }
    return data;
}
