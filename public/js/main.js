const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

// Get Username and Room from URL

const {username, room} = Qs.parse(location.search,{
  ignoreQueryPrefix : true
})
console.log(username,room)

const socket = io();

//join chat room
socket.emit('joinRoom',{username,room})

// Get Room and users

socket.on('roomUsers', ({ room,users}) => {
    outputRoomName(room)
    outputUsers(users)
})

// Message from server
socket.on("message", (message) => {
  // console.log(message);
  outputMessage(message);

  //to scroll down the messages
  chatMessages.scrollTop = chatMessages.scrollHeight

});

// Message submit

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage", msg);

  // clear inputs
  e.target.elements.msg.value = ''
  // or chatForm.reset()

  e.target.elements.msg.focus()

});

// output message to DOM

function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p  style = "display:flex; justify-content: space-between; color: lightblue" class="meta">${message.username} <span style = "color: white">${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM

function outputRoomName(room) 
{
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users)
{
  userList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}


document.getElementById('leave-btn').addEventListener('click',() => {
  const leaveRoom = confirm('Are you sure want to leave the chatroom?')
  if(leaveRoom) {
    window.location = '../index.html'
  }
  else {

  }
})