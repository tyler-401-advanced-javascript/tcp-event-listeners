const net = require('net')
const inquirer = require('inquirer')


const client = new net.Socket();

  client.connect(3001, 'localhost', () => {
  })


let name;
let room = 'public';
const messages = []

//create an object from user input and write it to the client. 
function sendMessage(text, room) {
  const event = JSON.stringify({
    eventType: 'message',
    username: name.slice(1),
    room: room,
    payload: text
  })
  client.write(event)
}

/*
{
  room: some room
  payload: something
  eventType: message
}
*/
//listen 
client.on('data', data => {
  const event = JSON.parse(data)
  if (event.eventType === 'message') {
    messages.push(event.payload, event.room);
    room = event.room;
    console.clear()
    messages.forEach(message => {
      console.log(message)
      console.log(' ')
    })
  }
})

async function getName() {
  // console.clear();
  const input = await inquirer.prompt([{ name: 'name', message: 'What is your name' }])
  name = `+${input.name}`;
  sendMessage(name);
  getInput()
}

async function getInput() {
  //todo: When a user joins a room , the room-name prompt doesnt change to reflect the new room for the first input.
  //todo: Why does the prompt remain hidden until after the user starts typing? Found.. not fixable. 
  const input = await inquirer.prompt([{ name: 'text', message: `${room}/${name.slice(1)}: ` }])
  sendMessage(input.text, room)
  getInput();
}

getName()