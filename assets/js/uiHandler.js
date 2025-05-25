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
            personTitleInput.addEventListener("input", () => validatePersonTitle(personTitleInput.value));
        }
    } else {
        personTitleLabel.remove();
        personTitleInput.remove();
        personTitleFeedback.remove();
    }
}

function isPasswordMatched() {
    const valid = passwordInput.value === confirmPasswordInput.value;
    confirmPasswordFeedback.textContent = valid ? "" : "Passwords do not match.";
    confirmPasswordFeedback.classList.toggle("text-error", !valid);
    confirmPasswordInput.classList.toggle("input-error", !valid);
    return valid;
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
fullNameInput.addEventListener("input", () => isFullNameValidated(fullNameInput.value));

function isAllInputsValid() {
    return (
        isPasswordMatched() &&
        isUsernameValidated(username.value) &&
        isEmailValidated(email.value) &&
        isPhoneNumberValidated(phoneNumber.value) &&
        isFullNameValidated(fullNameInput.value) &&
        isPasswordValid(passwordInput.value) &&
        (accountTypes.value === "company" ? validatePersonTitle(personTitleInput?.value || "") : true)
    );
}

function collectFormData() {
    const data = {
        username: username.value.trim(),
        email: email.value.trim(),
        phoneNumber: phoneNumber.value.trim(),
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
