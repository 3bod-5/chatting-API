const socket = io();
let selectedUserId = null;

// Get DOM elements
const usersList = document.getElementById('usersList');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatWith = document.getElementById('chatWith');
const logoutBtn = document.getElementById('logoutBtn');

// ✅ Notify server that user is online
socket.emit("addUser", window.APP_DATA.userId);

// Load all users
async function loadUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    
    if (data.success) {
      displayUsers(data.users);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Display users in sidebar
function displayUsers(users) {
  usersList.innerHTML = '';
  
  users.forEach(user => {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    userItem.dataset.userId = user._id;
    userItem.innerHTML = `
      <div>${user.name}</div>
      <div class="user-status">
        <span class="status-dot ${user.status === 'online' ? 'online' : 'offline'}"></span>
        ${user.status}
      </div>
    `;
    
    userItem.onclick = () => selectUser(user._id, user.name);
    usersList.appendChild(userItem);
  });
}

// ✅ Listen for user status changes
socket.on('userStatusChanged', (data) => {
  const userItem = document.querySelector(`[data-userId="${data.userId}"]`);
  if (userItem) {
    const statusDiv = userItem.querySelector('.user-status');
    statusDiv.innerHTML = `
      <span class="status-dot ${data.status === 'online' ? 'online' : 'offline'}"></span>
      ${data.status}
    `;
  }
});

// Select user to chat with
async function selectUser(userId, userName) {
  selectedUserId = userId;
  chatWith.textContent = `Chat with ${userName}`;
  messageInput.disabled = false;
  sendBtn.disabled = false;
  
  // Highlight selected user
  document.querySelectorAll('.user-item').forEach(item => {
    item.classList.remove('active');
  });
  event.target.closest('.user-item').classList.add('active');
  
  // Load message history
  await loadMessageHistory(userId);
}

// Load message history
async function loadMessageHistory(receiverId) {
  try {
    const response = await fetch(`/api/history/${receiverId}`);
    const data = await response.json();
    
    if (data.success) {
      displayMessages(data.messages);
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Display messages
function displayMessages(messages) {
  messagesContainer.innerHTML = '';
  
  messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    const isOwn = msg.sender === window.APP_DATA.userId;
    messageDiv.className = `message ${isOwn ? 'sent' : 'received'}`;
    
    const timestamp = new Date(msg.createdAt).toLocaleTimeString();
    
    messageDiv.innerHTML = `
      <div class="message-bubble">
        ${msg.text}
        <div class="message-time">${timestamp}</div>
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
  });
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  
  if (!text || !selectedUserId) return;
  
  try {
    const response = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverId: selectedUserId,
        text
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      messageInput.value = '';
      loadMessageHistory(selectedUserId);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// ✅ Listen for real-time messages
socket.on('getMessage', (message) => {
  if (message.senderId === selectedUserId) {
    loadMessageHistory(selectedUserId);
  }
});

// Logout
logoutBtn.onclick = () => {
  window.location.href = '/api/auth/logout';
};

// Load users on page load
loadUsers();

// Reload users every 30 seconds to update status
setInterval(loadUsers, 30000);
