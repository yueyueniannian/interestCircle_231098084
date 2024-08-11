const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const upload = multer();
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let users = [];
let circles = [];
let posts = [];
let comments = [];

// 用户注册
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).send('用户名已存在');
    }
    users.push({ username, password });
    res.status(200).send('注册成功');
});

// 用户登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.status(200).send('登录成功');
    } else {
        res.status(400).send('用户名或密码错误');
    }
});

// 创建兴趣圈
app.post('/api/createCircle', (req, res) => {
    const { name } = req.body;
    if (circles.find(c => c.name === name)) {
        return res.status(400).send('兴趣圈已存在');
    }
    circles.push({ name, posts: [], comments: [], activity: 0 });
    res.status(200).send('兴趣圈创建成功');
});

// 获取所有兴趣圈
app.get('/api/circles', (req, res) => {
    const circlesWithActivity = circles.map(circle => ({
        ...circle,
        activity: circle.posts.length + circle.comments.length
    }));
    res.status(200).json(circlesWithActivity);
});

// 发帖
app.post('/api/post/:circleName', upload.single('image'), (req, res) => {
    const circleName = decodeURIComponent(req.params.circleName);
    const circle = circles.find(c => c.name === circleName);
    if (!circle) {
        return res.status(400).send('兴趣圈不存在');
    }
    const { title, content } = req.body;
    const image = req.file ? req.file.buffer.toString('base64') : '';
    const post = { title, content, image, comments: [] };
    circle.posts.push(post);
    circle.activity += 1;
    posts.push(post);
    res.status(200).send('发帖成功');
});

// 获取特定兴趣圈的帖子
app.get('/api/posts/:circleName', (req, res) => {
    const circleName = decodeURIComponent(req.params.circleName);
    const circle = circles.find(c => c.name === circleName);
    if (!circle) {
        return res.status(400).send('兴趣圈不存在');
    }
    res.status(200).json(circle.posts);
});


// 获取帖子
app.get('/api/post/:title', (req, res) => {
    const { title } = req.params;
    const post = posts.find(p => p.title === title);
    if (post) {
        res.status(200).json(post);
    } else {
        res.status(400).send('帖子不存在');
    }
});

// 评论
app.post('/api/comment', upload.none(), (req, res) => {
    const { postTitle, content } = req.body;
    const post = posts.find(p => p.title === postTitle);
    if (!post) {
        return res.status(400).send('帖子不存在');
    }
    const comment = { content };
    post.comments.push(comment);
    comments.push(comment);
    const circle = circles.find(c => c.posts.includes(post));
    if (circle) {
        circle.comments.push(comment);
        circle.activity += 1;
    }
    res.status(200).send('评论成功');
});

// 获取所有评论
app.get('/api/comments', (req, res) => {
    res.status(200).json(comments);
});

// 静态页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/circle/:name', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'circle.html'));
});

app.get('/post/:title', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'post.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

