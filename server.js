const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
    console.log('UNCHAUGHT EXCEPTION, shutting down... ⛔')
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({
    path: './config.env'
})

const app = require('./app')

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
 
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION, shutting down... ⛔')
    console.log(err.name, err.message);

    server.on('close', () => {
        process.exit(1);
    })
});