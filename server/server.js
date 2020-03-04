const net = require('net')

const server = net.createServer()

const PORT = process.env.PORT || 3001;


server.listen(3001, () => {
  console.log(`Server up on ${PORT}`)
})

const socketPool = {
  //172.186.333 : { socket: Socket Obj, username: andrew } 
}

const usernames = {
  //andrew : Socket Obj
}

const chatRooms = {
  // mainRoom : {andrew: Obj, tyler: Obj, etc}
}

//this only fires on a new client connection.
server.on('connection', (socket) => {

  //put the socket for this connection into the black box, with index <the ip>
  const id = socket.localAddress;
  socketPool[id] = socket;

  //when the user sends a second request, they enter here. 'socket' doesnt mean anything. 
  socket.on('data', (buffer) => executeBufferAction(buffer, socketPool[id]))
  socket.on('error', e => console.error(e))
  socket.on('end', () => delete socketPool[id])

})

server.on('error', console.error)

function executeBufferAction(buffer, socketId) {

  //change the raw buffer into a string, then json parse it.
  const message = JSON.parse(buffer.toString().trim());
  console.log(message);
  switch (message.payload.slice(0, 1)) {
    case '+':
      usernames[message.payload.substr(1)] = socketId
      break
    case '/':
      executeCommand(message, socketId);
      break;
    case '@':
      broadcastToOne(message);
      break
    default:
      broadcastToAll(message);
  }
}

function broadcastToAll(message) {
  for (let user in usernames) {
    usernames[user].write(JSON.stringify(message))
  }
  console.log(chatRooms)
}

function broadcastToOne(message) {
  try {
    // @andrew hi there
    // [@andrew, hi, there]
    // @andrew
    // andrew
    const target = message.payload.split(' ')[0].slice(1)
    usernames[target].write(JSON.stringify(message))
  } catch (e) {
    console.error(e.message)
  }
}
/*
{
  eventType: message
  username: tyler
  payload: /newRoom murica
}
*/
function executeCommand(message, socketId) {
  const commandArray = message.payload.split(' ')
  const command = commandArray[0].slice(1)
  switch (command) {
    case 'newRoom':
      roomConstructor(message.username, commandArray[1], socketId);
      break;
    case 'rooms':
      socketId.write(JSON.stringify(chatRooms))
      break;
    case 'joinRoom':
      joinRoom(message.username, commandArray[1], socketId)
      break;
    case 'p':
      //todo: add this function.
      //make a public call from the rooftops
  }
}

/*
{
  murica: {
    Tyler: SocketObj,
    Andrew: SocketObj
  }
}
*/
function joinRoom(username, command, socketId) {

  //add the person to the chatroom they specified.
  chatRooms[command][username] = socketId;
  socketId.write(JSON.stringify(
    {
      eventType: 'message',
      room: command,
      payload: `You joined ${command}!, fuck ya`
    }
  ))
  

}

function roomConstructor(username, roomName, socketId) {
  //make the chatroom and stick the user in it.
  chatRooms[roomName] = {
    [username]: socketId
  }
  socketId.write(JSON.stringify(
    {
      eventType: 'message',
      room: roomName,
      payload: `You joined ${roomName}!, fuck ya`
    }
  ))
}

