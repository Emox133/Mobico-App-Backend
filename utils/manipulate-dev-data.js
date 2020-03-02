const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Post = require('./../models/postModel');
const User = require('./../models/userModel');

dotenv.config({
    path: './config.env'
});

//* Top Level Code
const posts = JSON.parse(fs.readFileSync('./dev-data/posts.json'));
const users = JSON.parse(fs.readFileSync('./dev-data/users.json'));

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('DB connection successfull...'))

//* Import all documents to a certain collection
const importAll = async function() {
    try {
        // await Post.create(posts)
        await User.create(users)
        console.log('Documents imported successfully. 🎉')
    }
    catch(err) {
        console.error(err);
    }
    process.exit();
};

//* Delete all documents in a certain collection
const deleteAll = async function() {
    try {
        // await Post.deleteMany()l
        await User.deleteMany()
        console.log('Documents deleted successfully. ❗')
    }
    catch(err) {
        console.error(err);
    }
    process.exit(0);
};

if(process.argv[2] === '--import') {
    importAll();
} else if (process.argv[2] === '--delete') {
    deleteAll();
} 


