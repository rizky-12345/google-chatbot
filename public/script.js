const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const conversationHistory = [];
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  conversationHistory.push({ role: 'user', text: userMessage });
  input.value = '';

  // Show a thinking indicator
  const thinkingMessage = appendMessage('bot', 'Gemini is thinking...');
  thinkingMessage.classList.add('thinking');

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation: conversationHistory }),
    });

    const result = await response.json();
    chatBox.removeChild(thinkingMessage); // Remove thinking indicator

    if (result.success) {
      const botMessage = result.data;
      appendMessage('bot', botMessage);
      conversationHistory.push({ role: 'model', text: botMessage });
    } else {
      appendMessage('bot', `Error: ${result.message}`);
    }
  } catch (error) {
    chatBox.removeChild(thinkingMessage); // Remove thinking indicator
    appendMessage('bot', 'Sorry, something went wrong with the connection.');
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
