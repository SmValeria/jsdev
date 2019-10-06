import 'normalize.css';
import './assets/css/layout.css';
import './assets/css/style.css';
import './assets/css/member.css';
import './assets/css/messages.css';

import memberNode from "./template/onlineMember.hbs";
import messageNode from "./template/messages.hbs";

import {validateForm, showInputError} from './helpers/validateForm';
import {getDate} from './helpers/getDate';

let allUsers = new Map();
let onlineUsers = [];
const currentUser = {};


const socket = new WebSocket('ws://localhost:9000');

socket.onopen = function (event) {
  socket.send(JSON.stringify({
    payload: 'getInformation',
    data: {}
  }))
};

socket.onmessage = function (event) {
  const message = JSON.parse(event.data);

  switch (message.payload) {
    case "getInformation":
      renderAllInformation(message.data);
      break;
    case "loginUser":
      updateCurrentUserInfo(message.data);
      break;
    case "sendNewUser":
      updateInfoWithNewUser(message.data);
      break;
    case "rejectToCreateUser":
      showLoginError(message.data);
      break;
    case "offlineUser":
      removeUser(message.data);
      break;
    case "renderNewMessage":
      renderMessage(message.data);
      break;
    case "renderPhoto":
      renderUserPhoto(message.data);
      break;
    default:
      console.log('some error');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const loginBlock = document.querySelector('.login');
  const loginFields = loginBlock.querySelectorAll('input');
  const chatBlock = document.querySelector('.chat');

  document.addEventListener('click', (event) => {
    if (event.target.closest('.login__close')) {
      loginBlock.classList.add('hidden');
      chatBlock.classList.remove('hidden');
    }

    if (event.target.closest('.chat__login-link')) {
      event.preventDefault();
      loginBlock.classList.remove('hidden');
      chatBlock.classList.add('hidden');
    }

    if (event.target.closest('.login__form-btn')) {
      event.preventDefault();
      const loginForm = event.target.closest('.login__form');
      if (!validateForm(loginForm, ['name', 'nick'])) {
        return;
      }
      currentUser.name = loginForm.elements.name.value;
      currentUser.nick = loginForm.elements.nick.value;
      socket.send(JSON.stringify({
        payload: 'newUser',
        data: currentUser
      }));
    }

    if (event.target.closest('.new-message__btn')) {
      event.preventDefault();

      const messageInput = document.querySelector('.new-message__field');
      if (!messageInput.value) return;

      socket.send(JSON.stringify({
        payload: 'newMessage',
        data: {
          text: messageInput.value,
          time: getDate()
        }
      }));
      messageInput.value = '';
    }

    if (event.target.closest('.members__appearance')) {
      const userNick = event.target.dataset.label;
      event.target.addEventListener('change', (event)=>{
        let reader = new FileReader();
        const file = event.target.files[0];

        reader.readAsDataURL(file);

        reader.onload = function() {
          socket.send(JSON.stringify({
            payload: 'newPhoto',
            data: {
              nick: userNick,
              photo: reader.result,
            }
          }));
        };

        reader.onerror = function() {
          console.log(reader.error);
        };
      })
    }
  });

  loginFields.forEach((field) => {
    field.addEventListener('focus', (event) => {
      field.parentElement
          .nextElementSibling
          .classList
          .add('hidden');
    })
  });
});

function renderAllInformation(data) {
  data.allUsers.forEach((user) => {
    allUsers.set(user[0], user[1])
  });

  onlineUsers = data.onlineUsers;
  if (onlineUsers.length > 0) {
    renderUsers(...onlineUsers);
  }

  if(data.messages.length > 0) {
    renderAllMessages(data.messages);
  }

  updateMembersCount();
}

function updateCurrentUserInfo(data) {
  onlineUsers.push(data.nick);
  if (allUsers.has(data.nick)) {
    let updateDataUser = allUsers.get(data.nick);
    updateDataUser.name = data.name;
    allUsers.set(data.nick, updateDataUser);
  } else {
    allUsers.set(data.nick, data);
  }
  addClassOnOwnMessage(data.nick);
  renderUsers(data.nick);
  updateMembersCount();
  showChatBlock();
}

function updateInfoWithNewUser(data) {
  onlineUsers.push(data.nick);
  if (allUsers.has(data.nick)) {
    let updateDataUser = allUsers.get(data.nick);
    updateDataUser.name = data.name;
    allUsers.set(data.nick, updateDataUser);
  } else {
    allUsers.set(data.nick, data);
  }
  renderUsers(data.nick);
  updateMembersCount();
}

function removeUser(data) {
  onlineUsers.splice(onlineUsers.indexOf(data.nick), 1);
  const onlineMemberContainer = document.querySelector('.sidebar__members');
  let removedUser = onlineMemberContainer.querySelector(`[data-nick="${data.nick}"]`);
  onlineMemberContainer.removeChild(removedUser);
  updateMembersCount();
}

function renderUsers(...userList) {

  const onlineMemberContainer = document.querySelector('.sidebar__members');
  let list = '';
  userList.forEach((user) => {

    const currentUser = allUsers.get(user);

    list += memberNode(currentUser);
  });
  onlineMemberContainer.insertAdjacentHTML('beforeend', list);
}

function updateMembersCount() {
  if (allUsers.size === 0) return;

  const onlineUsersContainer = document.querySelector('#members-count-online');
  const allUsersContainer = document.querySelector('#members-count-all');

  onlineUsersContainer.textContent = `${onlineUsers.length}`;
  allUsersContainer.textContent = `${allUsers.size}`;
}

function renderMessage(data) {
  updateMessageBlock(data);
  updateSidebar(data);
}

function showChatBlock() {
  const loginBlock = document.querySelector('.login');
  const loginForm = loginBlock.querySelector('.login__form');
  const chatBlock = document.querySelector('.chat');
  loginForm.reset();
  loginBlock.classList.add('hidden');
  chatBlock.classList.remove('hidden');
  chatBlock.classList.add('active');
}

function showLoginError(text) {
  const field = document.querySelector('#nick');
  showInputError(field, text);
}

function updateSidebar(data) {
  const sidebarMessageInfo = document.querySelector('.sidebar__members');
  const messageAuthorItem = sidebarMessageInfo.querySelector(`[data-nick="${data.nick}"]`);
  const messageContainer = messageAuthorItem.querySelector('.members__message');
  messageContainer.textContent = data.message;
}


function updateMessageBlock(data) {

  const messagesBox = document.querySelector('.messages__box');

  if(messagesBox.children.length > 0) {
    const lastAuthor = messagesBox
        .lastElementChild
        .getAttribute('data-nick');
    if(lastAuthor === data.nick) {
      let messageContainer = messagesBox.lastElementChild.querySelector('.messages__list');
      let messageContent = `<li class="messages__content">
                              ${data.message} 
                              <time class="messages__time">${data.time}</time>
                            </li>`;
      messageContainer.insertAdjacentHTML('beforeend', messageContent);
      return;
    }
  }

  data.name = allUsers.get(data.nick).name;
  data.owner = (data.nick === currentUser.nick);
  if(allUsers.get(data.nick).photo) {
    data.photo = allUsers.get(data.nick).photo;
  }
  data.messageInfoArr = new Array({
        message: data.message,
        time: data.time
      });
  let message = messageNode(data);
  messagesBox.insertAdjacentHTML('beforeend', message);
}

function renderAllMessages(data) {
  const messagesBox = document.querySelector('.messages__box');
  let messageInner = '';
  data.forEach((item)=> {
    item.name = allUsers.get(item.nick).name;
    if(allUsers.get(item.nick).photo) {
      item.photo = allUsers.get(item.nick).photo;
    }
    item.owner = (item.nick === currentUser.nick);
    messageInner += messageNode(item);
  });
  messagesBox.insertAdjacentHTML('beforeend', messageInner);
}

function addClassOnOwnMessage(nick) {
  const messageBox = document.querySelector('.messages__box');

  const ownMessage = messageBox.querySelectorAll(`[data-nick="${nick}"]`);

  if(ownMessage) {
    ownMessage.forEach((message)=>{
      message.classList.add('messages__item--owner');
    });
  }
}


function renderUserPhoto(data) {

  let updateDataUser = allUsers.get(data.nick);

  updateDataUser.photo = data.photo;
  allUsers.set(data.nick, updateDataUser);

  let allUserAvatar = document.querySelectorAll(`[data-photo="${data.nick}"]`);
  allUserAvatar.forEach((img)=>{
    img.src = data.photo;
    img.classList.remove('none');
  })
}