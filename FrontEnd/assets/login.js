const button = document.querySelector('.btn');
console.log(button);
const email = document.getElementById('email');
const password = document.getElementById('psw');

button.addEventListener('click', () => {
  const url = 'http://localhost:5678/api/users/login';
  const data = { email: email.value, password: password.value };
  console.log(data);
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then((response) => {
      console.log(response);
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Identifiant ou mot de passe incorrect');
      }
    })
    .then((response) => {
      console.log(response);
      localStorage.setItem('token', response.token);  
      window.location.href = './index.html';
    });
});

const modifyBtn = document.getElementById('modify-btn');
const token = localStorage.getItem('token');



