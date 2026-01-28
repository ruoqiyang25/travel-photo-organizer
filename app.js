// 应用状态
const state = {
    photos: [],
    currentIndex: 0,
    keptPhotos: [],
    deletedPhotos: [],
    history: []
};

// DOM 元素
let uploadSection, swipeSection, generateSection;
let cardStack, fileInput;
let keptCount, deletedCount, remainingCount;
let btnDelete, btnKeep, btnUndo;
let hintDelete, hintKeep;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEventListeners();
});

// 初始化 DOM 元素
function initElements() {
    uploadSection = document.getElementById('upload-section');
    swipeSection = document.getElementById('swipe-section');
    generateSection = document.getElementById('generate-section');
    cardStack = document.getElementById('card-stack');
    fileInput = document.getElementById('file-input');
    
    keptCount = document.getElementById('kept-count');
    deletedCount = document.getElementById('deleted-count');
    remainingCount = document.getElementById('remaining-count');
    
    btnDelete = document.getElementById('btn-delete');
    btnKeep = document.getElementById('btn-keep');
    btnUndo = document.getElementById('btn-undo');
    
    hintDelete = document.querySelector('.hint-delete');
    hintKeep = document.querySelector('.hint-keep');
}

// 初始化事件监听
function initEventListeners() {
    // 文件上传
    fileInput.addEventListener('change', handleFileUpload);
    
    // 拖拽上传
    const uploadBox = document.querySelector('.upload-box');
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#667eea';
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = 'transparent';
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'transparent';
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            loadPhotos(files);
        }
    });
    
    // 按钮事件
    btnDelete.addEventListener('click', () => swipeCard('left'));
    btnKeep.addEventListener('click', () => swipeCard('right'));
    btnUndo.addEventListener('click', undoLastAction);
    
    // 视频生成按钮
    document.getElementById('btn-generate-video').addEventListener('click', generateVideo);
    document.getElementById('btn-restart').addEventListener('click', restart);
}

// 处理文件上传
function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        loadPhotos(files);
    }
}

// 加载照片
function loadPhotos(files) {
    state.photos = files.map((file, index) => ({
        id: index,
        file: file,
        url: URL.createObjectURL(file)
    }));
    
    state.currentIndex = 0;
    state.keptPhotos = [];
    state.deletedPhotos = [];
    state.history = [];
    
    updateStats();
    showSwipeSection();
    renderCards();
}

// 显示滑动区域
function showSwipeSection() {
    uploadSection.style.display = 'none';
    swipeSection.style.display = 'flex';
    generateSection.style.display = 'none';
}

// 渲染卡片
function renderCards() {
    cardStack.innerHTML = '';
    
    // 渲染最多3张卡片（当前 + 后面2张）
    const cardsToShow = 3;
    for (let i = 0; i < cardsToShow; i++) {
        const photoIndex = state.currentIndex + i;
        if (photoIndex < state.photos.length) {
            createCard(state.photos[photoIndex], i);
        }
    }
}

// 创建卡片
function createCard(photo, stackIndex) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.photoId = photo.id;
    
    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = '照片';
    
    card.appendChild(img);
    cardStack.appendChild(card);
    
    // 只为最上面的卡片添加交互
    if (stackIndex === 0) {
        initCardSwipe(card);
    }
}

// 初始化卡片滑动
function initCardSwipe(card) {
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let isDragging = false;
    
    const onStart = (e) => {
        // 确保只响应最上层的卡片
        if (card !== cardStack.firstElementChild) return;
        
        isDragging = true;
        const point = e.type.includes('mouse') ? e : e.touches[0];
        startX = point.clientX;
        startY = point.clientY;
        card.style.transition = 'none';
        e.preventDefault();
    };
    
    const onMove = (e) => {
        if (!isDragging) return;
        
        const point = e.type.includes('mouse') ? e : e.touches[0];
        currentX = point.clientX - startX;
        currentY = point.clientY - startY;
        
        const rotation = currentX * 0.1;
        card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
        
        // 更新提示标签
        if (Math.abs(currentX) > 50) {
            if (currentX > 0) {
                hintKeep.classList.add('active');
                hintDelete.classList.remove('active');
                card.classList.add('swiping-right');
                card.classList.remove('swiping-left');
            } else {
                hintDelete.classList.add('active');
                hintKeep.classList.remove('active');
                card.classList.add('swiping-left');
                card.classList.remove('swiping-right');
            }
        } else {
            hintKeep.classList.remove('active');
            hintDelete.classList.remove('active');
            card.classList.remove('swiping-left', 'swiping-right');
        }
    };
    
    const onEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        hintKeep.classList.remove('active');
        hintDelete.classList.remove('active');
        
        const threshold = 100;
        
        if (Math.abs(currentX) > threshold) {
            // 滑动距离足够，执行操作
            if (currentX > 0) {
                animateCardOut(card, 'right');
                savePhoto('keep');
            } else {
                animateCardOut(card, 'left');
                savePhoto('delete');
            }
        } else {
            // 滑动距离不够，回弹
            card.style.transition = 'transform 0.3s ease';
            card.style.transform = '';
            card.classList.remove('swiping-left', 'swiping-right');
        }
        
        currentX = 0;
        currentY = 0;
    };
    
    // 鼠标事件
    card.addEventListener('mousedown', onStart);
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseup', onEnd);
    card.addEventListener('mouseleave', onEnd);
    
    // 触摸事件
    card.addEventListener('touchstart', onStart, { passive: false });
    card.addEventListener('touchmove', onMove, { passive: true });
    card.addEventListener('touchend', onEnd);
}

// 滑动卡片动画
function animateCardOut(card, direction) {
    card.style.transition = 'transform 0.3s ease';
    const distance = window.innerWidth * 1.5;
    const rotate = direction === 'right' ? 30 : -30;
    card.style.transform = `translate(${direction === 'right' ? distance : -distance}px, ${-100}px) rotate(${rotate}deg)`;
    
    setTimeout(() => {
        card.remove();
        nextCard();
    }, 300);
}

// 通过按钮滑动卡片
function swipeCard(direction) {
    const topCard = cardStack.querySelector('.photo-card');
    if (!topCard) return;
    
    if (direction === 'left') {
        topCard.classList.add('swiping-left');
        setTimeout(() => {
            animateCardOut(topCard, 'left');
            savePhoto('delete');
        }, 100);
    } else {
        topCard.classList.add('swiping-right');
        setTimeout(() => {
            animateCardOut(topCard, 'right');
            savePhoto('keep');
        }, 100);
    }
}

// 保存照片决定
function savePhoto(action) {
    const photo = state.photos[state.currentIndex];
    
    // 记录历史
    state.history.push({
        photo: photo,
        action: action,
        index: state.currentIndex
    });
    
    if (action === 'keep') {
        state.keptPhotos.push(photo);
    } else {
        state.deletedPhotos.push(photo);
    }
    
    updateStats();
}

// 下一张卡片
function nextCard() {
    state.currentIndex++;
    
    if (state.currentIndex >= state.photos.length) {
        // 所有照片处理完成
        showGenerateSection();
    } else {
        // 为新的顶部卡片添加滑动功能
        const newTopCard = cardStack.firstElementChild;
        if (newTopCard) {
            initCardSwipe(newTopCard);
        }
        
        // 渲染新卡片
        const cardsCount = cardStack.children.length;
        const nextIndex = state.currentIndex + cardsCount;
        
        if (nextIndex < state.photos.length) {
            createCard(state.photos[nextIndex], cardsCount);
        }
    }
}

// 撤销上一个操作
function undoLastAction() {
    if (state.history.length === 0) return;
    
    const lastAction = state.history.pop();
    
    // 从保存的列表中移除
    if (lastAction.action === 'keep') {
        state.keptPhotos = state.keptPhotos.filter(p => p.id !== lastAction.photo.id);
    } else {
        state.deletedPhotos = state.deletedPhotos.filter(p => p.id !== lastAction.photo.id);
    }
    
    // 回退索引
    state.currentIndex = lastAction.index;
    
    updateStats();
    renderCards();
}

// 更新统计
function updateStats() {
    keptCount.textContent = state.keptPhotos.length;
    deletedCount.textContent = state.deletedPhotos.length;
    remainingCount.textContent = state.photos.length - state.currentIndex;
}

// 显示视频生成区域
function showGenerateSection() {
    uploadSection.style.display = 'none';
    swipeSection.style.display = 'none';
    generateSection.style.display = 'block';
    
    document.getElementById('final-kept-count').textContent = state.keptPhotos.length;
    
    // 显示保留的照片
    const grid = document.getElementById('kept-photos-grid');
    grid.innerHTML = '';
    
    state.keptPhotos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.url;
        img.alt = '保留的照片';
        grid.appendChild(img);
    });
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 生成视频
async function generateVideo() {
    const progressSection = document.getElementById('generation-progress');
    const videoPreview = document.getElementById('video-preview');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    progressSection.style.display = 'block';
    videoPreview.style.display = 'none';
    
    // 获取配置
    const title = document.getElementById('video-title').value || '我的旅行日记';
    const style = document.getElementById('video-style').value;
    const music = document.getElementById('background-music').value;
    const addVoiceover = document.getElementById('add-voiceover').checked;
    const addCaptions = document.getElementById('add-captions').checked;
    
    const config = {
        title,
        style,
        music,
        addVoiceover,
        addCaptions
    };
    
    try {
        // 准备照片数据（转换为base64）
        progressText.textContent = '正在准备照片数据...';
        const photosData = await preparePhotosForAPI(state.keptPhotos);
        
        // 调用后端API
        progressFill.style.width = '10%';
        progressText.textContent = '正在连接AI视频生成服务...';
        
        const response = await fetch('http://localhost:3000/api/generate-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                photos: photosData,
                config: config
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '视频生成失败');
        }
        
        const result = await response.json();
        
        // 轮询检查视频生成状态
        await pollVideoStatus(result.taskId, progressFill, progressText);
        
        // 显示视频预览
        progressSection.style.display = 'none';
        videoPreview.style.display = 'block';
        displayGeneratedVideo(result.taskId);
        
    } catch (error) {
        console.error('Video generation error:', error);
        progressText.textContent = '视频生成失败: ' + error.message;
        progressText.style.color = '#ff3b30';
        
        // 如果后端服务未运行，显示友好提示
        if (error.message.includes('fetch')) {
            alert('⚠️ 无法连接到后端服务\n\n请确保：\n1. 已安装依赖：npm install\n2. 已配置API密钥：.env文件\n3. 已启动服务器：npm start\n\n或者查看README.md了解详细配置说明');
        }
    }
}

// 准备照片数据用于API调用
async function preparePhotosForAPI(photos) {
    const promises = photos.map(photo => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    data: reader.result, // base64
                    filename: photo.file.name
                });
            };
            reader.readAsDataURL(photo.file);
        });
    });
    
    return await Promise.all(promises);
}

// 轮询视频生成状态
async function pollVideoStatus(taskId, progressFill, progressText) {
    const maxAttempts = 120; // 最多等待10分钟
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 每5秒检查一次
        
        try {
            const response = await fetch(`http://localhost:3000/api/video-status/${taskId}`);
            const status = await response.json();
            
            // 更新进度
            progressFill.style.width = status.progress + '%';
            progressText.textContent = status.message || '正在生成视频...';
            
            if (status.status === 'completed') {
                progressFill.style.width = '100%';
                progressText.textContent = '视频生成完成！';
                return status;
            }
            
            if (status.status === 'failed') {
                throw new Error(status.message || '视频生成失败');
            }
            
        } catch (error) {
            console.error('Poll status error:', error);
        }
        
        attempts++;
    }
    
    throw new Error('视频生成超时');
}

// 显示生成的视频
function displayGeneratedVideo(taskId) {
    const video = document.getElementById('generated-video');
    video.src = `http://localhost:3000/api/video/download/${taskId}`;
    video.load();
    
    // 下载按钮
    document.getElementById('btn-download').onclick = () => {
        const a = document.createElement('a');
        a.href = video.src;
        a.download = `travel-video-${taskId}.mp4`;
        a.click();
    };
    
    // 分享按钮
    document.getElementById('btn-share').onclick = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '我的旅行视频',
                    text: '看看我的旅行日记视频！',
                    url: window.location.href
                });
            } catch (err) {
                console.log('分享取消或失败');
            }
        } else {
            alert('你的浏览器不支持分享功能');
        }
    };
}

// 创建视频预览
function createVideoPreview() {
    const video = document.getElementById('generated-video');
    
    // 使用 Canvas 创建简单的视频预览
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    
    let currentPhotoIndex = 0;
    const fps = 30;
    const photoDuration = 3; // 每张照片显示3秒
    const framesPerPhoto = fps * photoDuration;
    let frameCount = 0;
    
    const images = [];
    const loadPromises = state.keptPhotos.map(photo => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                images.push(img);
                resolve();
            };
            img.src = photo.url;
        });
    });
    
    Promise.all(loadPromises).then(() => {
        const stream = canvas.captureStream(fps);
        video.srcObject = stream;
        video.play();
        
        function drawFrame() {
            if (currentPhotoIndex >= images.length) {
                // 视频结束
                stream.getTracks().forEach(track => track.stop());
                // 转换为可下载的视频
                convertToDownloadableVideo(canvas, fps, framesPerPhoto * images.length);
                return;
            }
            
            const img = images[currentPhotoIndex];
            
            // 填充背景
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制照片（居中缩放）
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            
            // 添加简单的渐变效果
            const fadeFrames = fps / 2; // 0.5秒渐变
            if (frameCount < fadeFrames) {
                ctx.fillStyle = `rgba(0, 0, 0, ${1 - frameCount / fadeFrames})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            frameCount++;
            if (frameCount >= framesPerPhoto) {
                frameCount = 0;
                currentPhotoIndex++;
            }
            
            requestAnimationFrame(drawFrame);
        }
        
        drawFrame();
    });
}

// 转换为可下载的视频
function convertToDownloadableVideo(canvas, fps, totalFrames) {
    // 这里应该使用 MediaRecorder 录制视频
    // 为了简化，我们直接使用第一张照片作为封面
    const video = document.getElementById('generated-video');
    
    // 创建一个简单的视频预览
    if (state.keptPhotos.length > 0) {
        video.poster = state.keptPhotos[0].url;
    }
    
    // 下载按钮功能
    document.getElementById('btn-download').onclick = () => {
        alert('在实际应用中，这里会下载生成的视频文件。\n视频包含 ' + state.keptPhotos.length + ' 张照片。');
    };
    
    // 分享按钮功能
    document.getElementById('btn-share').onclick = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '我的旅行视频',
                    text: '看看我的旅行日记视频！',
                });
            } catch (err) {
                console.log('分享取消或失败');
            }
        } else {
            alert('你的浏览器不支持分享功能');
        }
    };
}

// 重新开始
function restart() {
    // 清理旧的对象URL
    state.photos.forEach(photo => {
        URL.revokeObjectURL(photo.url);
    });
    
    state.photos = [];
    state.currentIndex = 0;
    state.keptPhotos = [];
    state.deletedPhotos = [];
    state.history = [];
    
    updateStats();
    
    uploadSection.style.display = 'flex';
    swipeSection.style.display = 'none';
    generateSection.style.display = 'none';
    
    fileInput.value = '';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
