const fetchFriends = async () => {
  const response = await fetch('/chat-list');
  const friends = await response.json();
  return friends;
};

const showChat = async (friendName) => {
  const response = await fetch(`/chat/${friendName}`);
  const chatData = await response.json();

  const chatName = chatData.chatName;
  const messages = chatData.chats;

  renderChat(messages, chatName);
};

const renderChat = (messages, chatName) => {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.innerHTML = ''; // Clear previous content

  // Display chat name at the top
  const header = document.createElement('h2');
  header.textContent = `Chat with ${chatName}`;
  chatWindow.appendChild(header);

  const messagesContainer = document.createElement('div');
  messagesContainer.style.flex = '1';
  messagesContainer.style.overflowY = 'auto';

  messages.forEach((msg, index) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(msg.from === chatName ? 'from-them' : 'from-me');
    div.textContent = msg.msg;

    // TEMP: debugging visuals
    div.style.border = '1px solid red';
    div.style.backgroundColor = 'yellow';

    messagesContainer.appendChild(div);
  });

  // Input box and send button
  const inputBox = document.createElement('input');
  inputBox.type = 'text';
  inputBox.placeholder = 'Type your message';
  inputBox.style.marginTop = '10px';
  inputBox.style.padding = '10px';
  inputBox.style.borderRadius = '5px';
  inputBox.style.border = '1px solid #ccc';
  inputBox.style.width = 'calc(100% - 22px)';

  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';
  sendBtn.style.marginTop = '10px';
  sendBtn.style.padding = '10px';
  sendBtn.style.borderRadius = '5px';
  sendBtn.style.marginLeft = '5px';

  const inputContainer = document.createElement('div');
  inputContainer.style.display = 'flex';
  inputContainer.style.marginTop = '10px';

  inputContainer.appendChild(inputBox);
  inputContainer.appendChild(sendBtn);

  sendBtn.addEventListener('click', async () => {
    const msg = inputBox.value.trim();
    if (!msg) return;

    try {
      await fetch('/storechat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: chatName,
          msg: msg,
        }),
      });

      inputBox.value = '';
      await showChat(chatName); // Refresh chat after sending
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputContainer);
};

const renderFriends = async () => {
  const friends = await fetchFriends();
  const container = document.getElementById('friends-list');

  friends.forEach((friend) => {
    const div = document.createElement('div');
    div.className = 'friend';
    div.textContent = friend;

    div.addEventListener('click', () => {
      showChat(friend);
    });

    container.appendChild(div);
  });
};

const main = async () => {
  renderFriends();
};

globalThis.onload = main;
