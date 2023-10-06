document.addEventListener("DOMContentLoaded", () => {
  const registrationForm = document.getElementById("registration-form");

  registrationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(registrationForm);

    try {
      const response = await fetch("http://localhost:3000/train/register", {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        console.log("Company registered successfully");

        registrationForm.reset();
      } else {
        console.error("Registration failed with status code:", response.status);
      }
    } catch (error) {
      console.error("Error registering company:", error.message);
    }
  });
});
