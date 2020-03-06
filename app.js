const express = require('express');
const morgan = require('morgan');
const postsRouter = require('./routes/postRoutes');
const usersRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const fileupload = require('express-fileupload');
const path = require('path');
const os = require('os');

const app = express();
app.use(express.json());

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: os.tmpdir()
}));

//? 3rd party middlewares
if(process.env.MODE === 'development') {
    app.use(morgan('dev'));
}

//* Routes
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/users', usersRouter);

//* All routes that do not exist
app.all('*', (req, res, next) => {
    res.status(404).json({
        message: `The requested route ${req.originalUrl} is not found.`
    })
});

//! ERRORS
app.use(globalErrorHandler);

console.log(process.env.MODE);

module.exports = app
