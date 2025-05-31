const form = document.querySelector("form");
const submitBtn = document.querySelector("button");
const spinner = document.getElementById("spinner");
const submitLabel = document.getElementById("submit-label");
const formMessage = document.getElementById("form-message");

function setSubmitting(isSubmitting) {
  console.log("Input fields after submitted", fields);
  submitBtn.disabled = true;
  submitBtn.setAttribute("aria-busy", isSubmitting ? "true" : "false");
  spinner.classList.toggle("hidden", !isSubmitting);
  submitLabel.textContent = isSubmitting ? "Submitting..." : "Submit";
}

function showMessage(text, type = "success") {
  formMessage.textContent = text;
  formMessage.classList.remove("hidden", "success", "error");
  formMessage.classList.add(type);
  formMessage.setAttribute("aria-live", "assertive");
  formMessage.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    formMessage.classList.add("hidden");
    formMessage.textContent = "";
  }, 5000);
}

async function sendRegistration(data) {
  const response = await fetch("http://localhost/user-registration/api/register.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Registration failed");
  return result;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setSubmitting(true);
  try {
    const result = await sendRegistration(collectFormData());
    showMessage("🎉 " + result.message, "success");
    form.reset();
    togglePersonTitle("individual");
    resetChecklist();
  } catch (error) {
    showMessage("❌ " + error.message, "error");
    form.reset();
    togglePersonTitle("individual");
    resetChecklist();
  } finally {
    resetFields()
    setSubmitting(false);
    updateSubmitBtnState()
  }
});
