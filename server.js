const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app')
const cloudinary = require('cloudinary').v2

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

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

const port = process.env.PORT || 8080;

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