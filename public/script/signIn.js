const signIn = async (event) => {
  event.preventDefault();
  const form = document.getElementById('data');
  const formData = new FormData(form);
  const username = formData.get('username');
  const password = formData.get('pwd');
  const data = { username, password };
  const response = await fetch('/signin', {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const value = await response.json();
  console.log('response', value.isExist);

  if (value.isExist) {
    globalThis.location.href = value.url;
  } else {
    alert('not found');
  }
};

const main = () => {
  const button = document.querySelector('.submit');
  button.addEventListener('click', (event) => signIn(event));
};
globalThis.onload = main;
