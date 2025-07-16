document.addEventListener("DOMContentLoaded", function () {
  const designerForm = document.getElementById("designerForm");
  const phoneInput = document.querySelector('input[name="phone"]');

  const iti = window.intlTelInput(phoneInput, {
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    preferredCountries: ["eg", "sa", "ae", "us"],
    separateDialCode: true,
    initialCountry: "auto",
    geoIpLookup: function (callback) {
      fetch("https://ipapi.co/json")
        .then((res) => res.json())
        .then((data) => callback(data.country_code))
        .catch(() => callback("eg"));
    },
  });

  if (designerForm) {
    designerForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // ✅ استهداف جميع المدخلات ورسائل الخطأ
      const inputs = {
        email: document.querySelector('input[name="email"]'),
        password: document.querySelector('input[name="password"]'),
        confirmPassword: document.querySelector(
          'input[name="confirmPassword"]'
        ),
        firstName: document.querySelector('input[name="firstName"]'),
        lastName: document.querySelector('input[name="lastName"]'),
        phone: document.querySelector('input[name="phone"]'),
        bio: document.querySelector('textarea[name="bio"]'),
        role: document.getElementById("role"),
      };

      const errors = {
        email: document.getElementById("emailError"),
        password: document.getElementById("passwordError"),
        confirmPassword: document.getElementById("confirmPasswordError"),
        firstName: document.getElementById("firstNameError"),
        lastName: document.getElementById("lastNameError"),
        phone: document.getElementById("phoneError"),
        bio: document.getElementById("bioError"),
        role: document.getElementById("roleError"),
      };

      const specialtiesArray = Array.from(
        document.querySelectorAll('input[name="specialties"]:checked')
      ).map((e) => e.value);

      const profilePhotoInput = document.querySelector(
        'input[type="file"][name="profilePhoto"]'
      );
      const profilePhoto =
        profilePhotoInput.files.length > 0 ? profilePhotoInput.files[0] : null;

      const idCardPhotoInput = document.querySelector(
        'input[type="file"][name="idCardPhoto"]'
      );
      const idCardPhoto =
        idCardPhotoInput.files.length > 0 ? idCardPhotoInput.files[0] : null;

      // Check file sizes (maximum 5 MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

      if (profilePhoto && profilePhoto.size > MAX_FILE_SIZE) {
        showMessage(
          "❌ Profile photo size exceeds the allowed limit (5 MB)",
          "red"
        );
        hasError = true;
      }

      if (idCardPhoto && idCardPhoto.size > MAX_FILE_SIZE) {
        showMessage(
          "❌ ID card photo size exceeds the allowed limit (5 MB)",
          "red"
        );
        hasError = true;
      }

      // ✅ تحقق من الحقول الخاصة بالمهندسين فقط
      if (inputs.role.value === "Engineer") {
        // تحقق من التخصصات
        if (specialtiesArray.length === 0) {
          showMessage("❌ Please select at least one specialty.", "red");
          hasError = true;
        }

        // Check ID card (required for engineers)
        if (!idCardPhoto) {
          showMessage("❌ ID card photo is required for engineers.", "red");
          hasError = true;
        }

        // Check profile photo (optional)
        if (!profilePhoto) {
          showMessage("❌ Please upload a profile photo.", "red");
          hasError = true;
        }
      }

      // ✅ إعادة ضبط الأخطاء
      Object.keys(errors).forEach((key) => {
        errors[key].textContent = "";
        inputs[key].classList.remove("input-error");
      });

      let hasError = false;

      // ✅ التحقق من البريد الإلكتروني
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailRegex.test(inputs.email.value.trim())) {
        errors.email.textContent = "❌ Enter a valid email address";
        inputs.email.classList.add("input-error");
        hasError = true;
      }

      // ✅ التحقق من صحة كلمة المرور
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
      if (!passwordRegex.test(inputs.password.value.trim())) {
        errors.password.textContent =
          "❌ Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.";
        inputs.password.classList.add("input-error");
        hasError = true;
      }

      // ✅ التحقق من تطابق كلمتي المرور
      if (
        inputs.password.value.trim() !== inputs.confirmPassword.value.trim()
      ) {
        errors.confirmPassword.textContent = "❌ Passwords do not match.";
        inputs.confirmPassword.classList.add("input-error");
        hasError = true;
      }

      // ✅ التحقق من الاسم الأول والأخير
      if (inputs.firstName.value.trim().length < 2) {
        errors.firstName.textContent =
          "❌ First name must be at least 2 characters.";
        inputs.firstName.classList.add("input-error");
        hasError = true;
      }

      if (inputs.lastName.value.trim().length < 2) {
        errors.lastName.textContent =
          "❌ Last name must be at least 2 characters.";
        inputs.lastName.classList.add("input-error");
        hasError = true;
      }

      if (!iti.isValidNumber()) {
        errors.phone.textContent = "❌ Enter a valid phone number.";
        inputs.phone.classList.add("input-error");
        hasError = true;
      } else {
        // ✅ تحويل الرقم إلى التنسيق الدولي الصحيح
        inputs.phone.value = iti.getNumber();
      }

      // ✅ التحقق من السيرة الذاتية (bio)
      if (inputs.role.value !== "Admin" && inputs.bio.value.trim().length < 5) {
        errors.bio.textContent = "❌ Bio must be at least 5 characters.";
        inputs.bio.classList.add("input-error");
        hasError = true;
      }

      // ✅ التحقق من اختيار الدور (role)
      if (!inputs.role.value) {
        errors.role.textContent = "❌ Please select a role.";
        inputs.role.classList.add("input-error");
        hasError = true;
      }

      // ✅ إذا كان هناك خطأ، لا يتم إرسال الطلب
      if (hasError) {
        return;
      }

      // ✅ تعطيل زر الإرسال أثناء الطلب
      const submitButton = designerForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Saving...";

      const formData = new FormData();
      formData.append("firstName", inputs.firstName.value.trim());
      formData.append("lastName", inputs.lastName.value.trim());
      formData.append("email", inputs.email.value.trim());
      formData.append("phone", inputs.phone.value.trim());
      formData.append("password", inputs.password.value.trim());
      formData.append("confirmPassword", inputs.confirmPassword.value.trim());
      formData.append("bio", inputs.bio.value.trim());
      formData.append("role", inputs.role.value);

      specialtiesArray.forEach((s) => formData.append("specialties", s));
      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }
      if (idCardPhoto) {
        formData.append("idCardPhoto", idCardPhoto);
      }
      try {
        const response = await fetch("/register", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          showMessage("Successfully registered! Redirecting...", "green");

          setTimeout(() => {
            window.location.href = `/payment-policy?engineerId=${data.user._id}`;
          }, 2000);
        } else {
          try {
            const errorData = await response.json();
            console.error("Server Error:", errorData);

            // Show specific error message or provide helpful feedback
            let errorMessage = "Registration failed. Please try again.";

            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (response.status === 400) {
              errorMessage = "Please check your information and try again.";
            } else if (response.status === 409) {
              errorMessage =
                "This email is already registered. Please use a different email or login.";
            } else if (response.status >= 500) {
              errorMessage = "Server error. Please try again in a few minutes.";
            }

            showMessage(errorMessage, "red");
          } catch (parseError) {
            // If response is not JSON, try to get text
            try {
              const errorText = await response.text();
              console.error("Server Error:", errorText);

              // Try to extract meaningful error from text
              if (errorText.includes("email")) {
                showMessage(
                  "Email validation failed. Please check your email address.",
                  "red"
                );
              } else if (errorText.includes("password")) {
                showMessage(
                  "Password validation failed. Please check password requirements.",
                  "red"
                );
              } else if (
                errorText.includes("file") ||
                errorText.includes("upload")
              ) {
                showMessage(
                  "File upload failed. Please check your images and try again.",
                  "red"
                );
              } else {
                showMessage(
                  "Registration failed. Please check your information and try again.",
                  "red"
                );
              }
            } catch (textError) {
              showMessage(
                "Registration failed due to a network error. Please try again.",
                "red"
              );
            }
          }
        }
      } catch (error) {
        showMessage(`Error: ${error.message}`, "red");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Register";
      }
    });
  }
});

// ✅ Enhanced message display function
function showMessage(text, color) {
  const messageDiv = document.getElementById("message");
  if (!messageDiv) {
    // Create message div if it doesn't exist
    const newMessageDiv = document.createElement("div");
    newMessageDiv.id = "message";
    newMessageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-left: 4px solid;
    `;
    document.body.appendChild(newMessageDiv);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      newMessageDiv.style.opacity = "0";
      setTimeout(() => newMessageDiv.remove(), 300);
    }, 5000);

    newMessageDiv.style.display = "block";
    newMessageDiv.style.color =
      color === "red" ? "#721c24" : color === "green" ? "#0f5132" : color;
    newMessageDiv.style.backgroundColor =
      color === "red" ? "#f8d7da" : color === "green" ? "#d1e7dd" : "#fff3cd";
    newMessageDiv.style.borderLeftColor =
      color === "red" ? "#dc3545" : color === "green" ? "#198754" : "#ffc107";
    newMessageDiv.textContent = text;
  } else {
    messageDiv.style.display = "block";
    messageDiv.style.color = color;
    messageDiv.textContent = text;
  }
}

function previewProfilePhoto(event) {
  const input = event.target;
  const preview = document.querySelector(".profile-preview");
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.style.backgroundImage = `url(${e.target.result})`;
      preview.style.display = "block";
    };
    reader.readAsDataURL(input.files[0]);
  }
}
