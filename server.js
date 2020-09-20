const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app')

process.on('uncaughtException', (err) => {
    console.log('UNCHAUGHT EXCEPTION, shutting down... ⛔')
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({
    path: './config.env'
})

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
.then(() => console.log('DB connection successful'))

const port = process.env.PORT || 3000;

const server = app.listen(port, () => console.log(`Server started on port ${port}...`));

const io = require('socket.io')(server)
io.set('origins', '*:*')
io.on('connection', socket => {
  const id = socket.handshake.query.id
  socket.join(id)

  socket.on('send-message', ({ recipients, text }) => {
    recipients.forEach(recipient => {
      const newRecipients = recipients.filter(r => r !== recipient)
      newRecipients.push(id)
      socket.broadcast.to(recipient).emit('receive-message', {
        recipients: newRecipients, sender: id, text
      })
    })
  })
})

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION, shutting down... ⛔')
    console.log(err.name, err.message);

    server.on('close', () => {
        process.exit(1);
    })
});