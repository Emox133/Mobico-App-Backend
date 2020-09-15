const express = require('express');
// const morgan = require('morgan');
const cors = require('cors')
const postsRouter = require('./routes/postRoutes');
const usersRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const fileupload = require('express-fileupload');
const os = require('os');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const compression = require('compression')

const app = express();
app.use(cors())

app.use(helmet());

app.use(express.json());

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: os.tmpdir()
}));

//? 3rd party middlewares
// if(process.env.MODE === 'development') {
    //     app.use(morgan('dev'));
// }
const limiter = rateLimit({
    max: 300,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour :)'
})

app.use('/api', limiter);

app.use(mongoSanitize());

app.use(xss());

app.use(compression());

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

module.exports = app
