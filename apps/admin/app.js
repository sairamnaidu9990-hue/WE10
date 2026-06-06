const form = document.querySelector("#loginForm");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const submitButton = document.querySelector("#submitButton");
const togglePassword = document.querySelector("#togglePassword");
const message = document.querySelector("#message");

togglePassword.addEventListener("click", () => {
  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  togglePassword.textContent = shouldShow ? "Tutup" : "Lihat";
  togglePassword.setAttribute("aria-label", shouldShow ? "Sembunyikan password" : "Tampilkan password");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  message.textContent = "";
  message.className = "message";
  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "Memeriksa...";

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: usernameInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login gagal.");
    }

    message.textContent = "Login berhasil. Admin terverifikasi.";
    message.classList.add("success");
  } catch (error) {
    message.textContent = error.message;
    message.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "Masuk";
  }
});
