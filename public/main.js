const socket = io();
const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const emojiPicker = document.getElementById('emoji-picker');
const emojiButton = document.getElementById('emoji-button');

// Handle form submission
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

// Update total clients when received from server
socket.on('clients-total', (data) => {
    clientsTotal.innerHTML = `Total Clients: ${data}`;
});

// Send the message to the server
function sendMessage() {
    if (messageInput.value === '') return;
    const data = {
        name: nameInput.value || 'Anonymous',
        message: messageInput.value,
        dateTime: new Date(),
    };
    socket.emit('message', data);
    addMessageToUI(true, data);
    messageInput.value = '';  // Clear the input after sending
}

// Receive messages from the server
socket.on('chat-message', (data) => {
    addMessageToUI(false, data);
});

// Add message to the UI
function addMessageToUI(isOwnMessage, data) {
    clearFeedback();

    const li = document.createElement('li');
    li.classList.add(isOwnMessage ? 'message-right' : 'message-left');

    const p = document.createElement('p');
    p.classList.add('message');
    p.innerHTML = `
        ${data.message}
        <span>${data.name} - ${moment(data.dateTime).fromNow()}</span>
    `;

    li.appendChild(p);
    messageContainer.appendChild(li);
    scrollToBottom();
}

// Scroll to the bottom of the message container
function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Emit typing feedback to the server
messageInput.addEventListener('focus', () => {
    socket.emit('feedback', {
        feedback: `${nameInput.value} is typing a message`,
    });
});

messageInput.addEventListener('keypress', () => {
    socket.emit('feedback', {
        feedback: `${nameInput.value} is typing a message`,
    });
});

messageInput.addEventListener('blur', () => {
    socket.emit('feedback', {
        feedback: '',
    });
});

// Show typing feedback from other users
socket.on('feedback', (data) => {
    clearFeedback();
    const element = `
    <li class="message-feedback">
        <p class="feedback" id="feedback">${data.feedback}</p>
    </li>
    `;
    messageContainer.innerHTML += element;
});

// Clear feedback from the UI
function clearFeedback() {
    document.querySelectorAll('li.message-feedback').forEach((element) => {
        element.parentNode.removeChild(element);
    });
}

// Show or hide emoji picker when the emoji button is clicked
emojiButton.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

// Add emoji to message input when selected from emoji picker
emojiPicker.addEventListener('emoji-click', (event) => {
    messageInput.value += event.detail.unicode;
    emojiPicker.style.display = 'none';  // Hide the picker after selecting emoji
});
