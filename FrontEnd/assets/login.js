const button = document.querySelector(".btn");
const email = document.getElementById("email");
const password = document.getElementById("psw");
const errorMsg = document.getElementById("error-msg");

function displayError(message) {
  errorMsg.innerText = message;
  errorMsg.style.display = "block";
}

button.addEventListener("click", () => {
  if (!email.value || !password.value) {
    displayError("Veuillez remplir tous les champs");
    return;
  }

  const url = "http://localhost:5678/api/users/login";
  const data = { email: email.value, password: password.value };
  console.log(data);
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      console.log(response);
      if (response.ok) {
        errorMsg.style.display = "none";
        return response.json();
      } else {
        throw new Error("Identifiant ou mot de passe incorrect");
      }
    })
    .then((response) => {
      console.log(response);
      localStorage.setItem("token", response.token);
      window.location.href = "./index.html";
    })
    .catch((error) => {
      displayError(error.message);
    });
});



