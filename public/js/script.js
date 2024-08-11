document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const createCircleForm = document.getElementById('createCircleForm');
    const postForm = document.getElementById('postForm');
    const commentForm = document.getElementById('commentForm');

    // 登录
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
                .then(response => response.text())
                .then(data => {
                    if (data === '登录成功') {
                        window.location.href = '/home';
                    } else {
                        alert(data);
                    }
                });
        });
    }

    // 注册
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const password = registerForm.password.value;

            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
                .then(response => response.text())
                .then(data => {
                    if (data === '注册成功') {
                        window.location.href = '/';
                    } else {
                        alert(data);
                    }
                });
        });
    }

    // 创建兴趣圈
    if (createCircleForm) {
        createCircleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = createCircleForm.name.value;

            fetch('/api/createCircle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            })
                .then(response => response.text())
                .then(data => {
                    if (data === '兴趣圈创建成功') {
                        loadCircles();
                    } else {
                        alert(data);
                    }
                });
        });
    }

    // 加载兴趣圈
    function loadCircles() {
        fetch('/api/circles')
            .then(response => response.json())
            .then(data => {
                const circlesDiv = document.getElementById('circles');
                circlesDiv.innerHTML = '';
                data.forEach(circle => {
                    const circleBlock = document.createElement('div');
                    circleBlock.className = 'circle-block';
                    circleBlock.innerHTML = `<a href="/circle/${circle.name}">${circle.name} (活跃度: ${circle.activity})</a>`;
                    circlesDiv.appendChild(circleBlock);
                });
            });
    }

    // 初始加载兴趣圈
    if (document.getElementById('circles')) {
        loadCircles();
    }

    // 加载帖子
    function loadPosts(circleName) {
        fetch(`/api/posts/${encodeURIComponent(circleName)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const postsDiv = document.getElementById('posts');
                postsDiv.innerHTML = '';
                data.forEach(post => {
                    const postBlock = document.createElement('div');
                    postBlock.className = 'post-block';
                    postBlock.innerHTML = `<a href="/post/${encodeURIComponent(post.title)}">${post.title}</a><p>${post.content}</p>`;
                    if (post.image) {
                        const imgElement = document.createElement('img');
                        imgElement.src = `data:image/png;base64,${post.image}`;
                        postBlock.appendChild(imgElement);
                    }
                    postsDiv.appendChild(postBlock);
                });
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

// 初始加载帖子
    if (document.getElementById('posts')) {
        const circleName = window.location.pathname.split('/').slice(-1)[0];
        loadPosts(circleName);
    }


// 发帖
    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const circleName = window.location.pathname.split('/').pop();
            const title = postForm.title.value;
            const content = postForm.content.value;
            const image = postForm.image.files[0];

            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            fetch('/api/post/' + encodeURIComponent(circleName), {
                method: 'POST',
                body: formData
            })
                .then(response => response.text())
                .then(data => {
                    if (data === '发帖成功') {
                        loadPosts(circleName); // 重新加载帖子
                        postForm.reset();
                    } else {
                        alert(data);
                    }
                });
        });
    }

    // 评论
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const postTitle = decodeURIComponent(window.location.pathname.split('/').pop());
            const content = commentForm.content.value;

            const formData = new FormData();
            formData.append('postTitle', postTitle);
            formData.append('content', content);

            fetch('/api/comment', {
                method: 'POST',
                body: formData
            })
                .then(response => response.text())
                .then(data => {
                    if (data === '评论成功') {
                        loadComments(postTitle); // 重新加载评论
                        commentForm.content.value = '';
                    } else {
                        alert(data);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    }

    // 加载评论
    function loadComments(postTitle) {
        const post = posts.find(p => p.title === postTitle);
        if (post) {
            const commentsDiv = document.getElementById('comments');
            commentsDiv.innerHTML = '';
            post.comments.forEach(comment => {
                const commentBlock = document.createElement('div');
                commentBlock.className = 'comment-block';
                commentBlock.textContent = comment.content;
                commentsDiv.appendChild(commentBlock);
            });
        }
    }

    // 初始加载评论
    if (document.getElementById('comments')) {
        const postTitle = decodeURIComponent(window.location.pathname.split('/').pop());
        loadComments(postTitle);
    }
});




