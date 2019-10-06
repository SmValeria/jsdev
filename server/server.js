const WebSocket = require('ws');
let server = new WebSocket.Server({port: 9000});

let onlineUsers = new Set();
let allUsers = new Map;
let messages = [];

server.on('connection', function (ws) {
  ws.on('message', function (data) {
    const message = JSON.parse(data);
    switch (message.payload) {
      case "getInformation":
        sendInformation(ws);
        break;
      case "newUser":
        newUser(message.data, ws);
        break;
      case "newMessage":
        addNewMessage(message.data, ws);
        break;
      case "newPhoto":
        addPhoto(message.data);
        break;
      default:
        console.log('some error');
    }
  });
  ws.on('close', function () {
    if (ws.userData) {
      const nickName = ws.userData.nick;
      onlineUsers.delete(ws);
      server.clients.forEach((client) => {
        if (client !== ws) {
          client.send(JSON.stringify({
            payload: 'offlineUser',
            data: {
              nick: nickName
            }
          }));
        }
      })
    }
  })
});

function newUser(data, ws) {
  let isLogin = false;
  onlineUsers.forEach(value => {
    if (value.userData.nick === data.nick) {
      isLogin = true;
    }
  });
  if (isLogin) {
    ws.send(JSON.stringify({
      payload: 'rejectToCreateUser',
      data: 'Пользователь с таким ником online'
    }))
  } else {
    ws.userData = data;
    if (allUsers.has(data.nick)) {
      let uploadDataUser = allUsers.get(data.nick);
      uploadDataUser.name = data.name;
      allUsers.set(data.nick, uploadDataUser);
    } else {
      allUsers.set(data.nick, data)
    }
    onlineUsers.add(ws);
    server.clients.forEach((client) => {
      if (client === ws) {
        client.send(JSON.stringify({
          payload: 'loginUser',
          data: data
        }));
      } else {
        client.send(JSON.stringify({
          payload: 'sendNewUser',
          data: data
        }));
      }
    })
  }
}

function sendInformation(ws) {
  const onlineUsersForSend = [];
  onlineUsers.forEach(value => {
    onlineUsersForSend.push(value.userData.nick);
  });
  ws.send(JSON.stringify({
    payload: 'getInformation',
    data: {
      allUsers: Array.from(allUsers),
      onlineUsers: onlineUsersForSend,
      messages: messages
    }
  }))
}

function addNewMessage(data, ws) {
  let uploadDataUser = allUsers.get(ws.userData.nick);
  uploadDataUser.lastMessage = data.text;
  allUsers.set(ws.userData.nick, uploadDataUser);
  if ((messages.length > 0) &&
      (messages[messages.length - 1].nick === ws.userData.nick)) {
    messages[messages.length - 1].messageInfoArr.push({
      message: data.text,
      time: data.time,
    })
  } else {
    messages.push({
      nick: ws.userData.nick,
      messageInfoArr: new Array({
        message: data.text,
        time: data.time
      })
    })
  }
  server.clients.forEach((client) => {
    client.send(JSON.stringify({
      payload: 'renderNewMessage',
      data: {
        nick: ws.userData.nick,
        message: data.text,
        time: data.time
      }
    }))
  })
}

function addPhoto(data) {
  let uploadDataUser = allUsers.get(data.nick);
  uploadDataUser.photo = data.photo;
  allUsers.set(data.nick, uploadDataUser);

  server.clients.forEach((client) => {
    client.send(JSON.stringify({
      payload: 'renderPhoto',
      data: {
        nick: data.nick,
        photo: data.photo
      }
    }))
  })
}

