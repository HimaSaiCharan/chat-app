const signUp = async (event) => {
  event.preventDefault();
  const form = document.getElementById('form');
  const formData = new FormData(form);
  const username = formData.get('username');
  const password = formData.get('pwd');
  const data = { username, password };
  const response = await fetch('/signup', {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const { isAccountCreated, message, url } = await response.json();
  console.log('The response is', isAccountCreated, message);
  if (isAccountCreated) {
    globalThis.location.href = url;
  }

  alert(message);
};

const main = () => {
  const button = document.querySelector('.submit');
  button.addEventListener('click', (event) => signUp(event));
};

globalThis.onload = main;
