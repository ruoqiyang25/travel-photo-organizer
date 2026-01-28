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
    
    // 故事簿生成按钮
    document.getElementById('btn-generate-storybook').addEventListener('click', generateStorybook);
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
            if (currentX > 0) {
                animateCardOut(card, 'right');
                savePhoto('keep');
            } else {
                animateCardOut(card, 'left');
                savePhoto('delete');
            }
        } else {
            card.style.transition = 'transform 0.3s ease';
            card.style.transform = '';
            card.classList.remove('swiping-left', 'swiping-right');
        }
        
        currentX = 0;
        currentY = 0;
    };
    
    card.addEventListener('mousedown', onStart);
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseup', onEnd);
    card.addEventListener('mouseleave', onEnd);
    
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
        showGenerateSection();
    } else {
        const newTopCard = cardStack.firstElementChild;
        if (newTopCard) {
            initCardSwipe(newTopCard);
        }
        
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
    
    if (lastAction.action === 'keep') {
        state.keptPhotos = state.keptPhotos.filter(p => p.id !== lastAction.photo.id);
    } else {
        state.deletedPhotos = state.deletedPhotos.filter(p => p.id !== lastAction.photo.id);
    }
    
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

// 显示生成区域
function showGenerateSection() {
    uploadSection.style.display = 'none';
    swipeSection.style.display = 'none';
    generateSection.style.display = 'block';
    
    document.getElementById('final-kept-count').textContent = state.keptPhotos.length;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 生成旅行故事簿
async function generateStorybook() {
    const progressSection = document.getElementById('generation-progress');
    const storybookSection = document.getElementById('storybook-section');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    // 显示进度
    progressSection.style.display = 'block';
    storybookSection.style.display = 'none';
    progressFill.style.width = '0%';
    progressText.textContent = '正在准备照片...';
    progressText.style.color = '#718096';
    
    try {
        // 准备照片数据
        const photosData = await preparePhotosForAPI(state.keptPhotos);
        
        progressFill.style.width = '30%';
        progressText.textContent = '🤖 AI正在分析您的旅行照片...';
        
        // 调用API生成整体故事
        const response = await fetch('http://localhost:3000/api/generate-travel-story', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                photos: photosData,
                photoCount: photosData.length
            })
        });
        
        if (!response.ok) {
            throw new Error('故事生成失败');
        }
        
        const result = await response.json();
        
        progressFill.style.width = '100%';
        progressText.textContent = '✅ 旅行故事生成完成！';
        progressText.style.color = '#34c759';
        
        // 显示故事簿
        setTimeout(() => {
            progressSection.style.display = 'none';
            displayStorybook(result.story, photosData);
        }, 1500);
        
    } catch (error) {
        console.error('故事簿生成失败:', error);
        progressText.textContent = '❌ 生成失败: ' + error.message;
        progressText.style.color = '#ff3b30';
        
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            alert('⚠️ 无法连接到后端服务\n\n请确保：\n1. 已启动服务器：node server.js\n2. 服务器运行在：http://localhost:3000\n3. OpenAI API密钥已配置');
        } else {
            alert('生成失败：' + error.message);
        }
    }
}

// 显示故事簿
function displayStorybook(story, photos) {
    const storybookSection = document.getElementById('storybook-section');
    const narrativeDiv = document.getElementById('story-narrative');
    const galleryDiv = document.getElementById('story-gallery');
    
    // 显示故事文本
    narrativeDiv.innerHTML = `
        <div class="story-title">✨ 旅行故事</div>
        <div class="story-content">${story}</div>
    `;
    
    // 创建炫酷的幻灯片展示
    galleryDiv.innerHTML = `
        <div class="slideshow-container">
            <div class="slideshow-wrapper" id="slideshow-wrapper">
                ${photos.map((photo, index) => `
                    <div class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                        <img src="${photo.data}" alt="旅行照片 ${index + 1}">
                        <div class="slide-number">${index + 1} / ${photos.length}</div>
                    </div>
                `).join('')}
            </div>
            
            <!-- 导航按钮 -->
            <button class="slide-nav slide-prev" onclick="changeSlide(-1)">
                <span>‹</span>
            </button>
            <button class="slide-nav slide-next" onclick="changeSlide(1)">
                <span>›</span>
            </button>
            
            <!-- 指示器 -->
            <div class="slide-indicators">
                ${photos.map((_, index) => `
                    <span class="indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>
                `).join('')}
            </div>
            
            <!-- 自动播放控制 -->
            <button class="slideshow-toggle" onclick="toggleSlideshow()">
                <span id="slideshow-icon">⏸</span>
            </button>
        </div>
        
        <!-- 缩略图网格 -->
        <div class="thumbnail-grid">
            ${photos.map((photo, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})">
                    <img src="${photo.data}" alt="缩略图 ${index + 1}">
                    <div class="thumbnail-number">${index + 1}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // 初始化幻灯片
    initSlideshow(photos.length);
    
    // 设置分享和保存按钮
    document.getElementById('btn-download-story').onclick = () => downloadStory(story, photos);
    document.getElementById('btn-share-story').onclick = () => shareStory(story);
    
    storybookSection.style.display = 'block';
    storybookSection.scrollIntoView({ behavior: 'smooth' });
}

// 幻灯片变量
let currentSlideIndex = 0;
let slideshowInterval = null;
let isPlaying = true;

// 初始化幻灯片
function initSlideshow(totalSlides) {
    currentSlideIndex = 0;
    startSlideshow();
}

// 开始自动播放
function startSlideshow() {
    if (slideshowInterval) clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        changeSlide(1);
    }, 3000); // 每3秒切换
    isPlaying = true;
    const icon = document.getElementById('slideshow-icon');
    if (icon) icon.textContent = '⏸';
}

// 停止自动播放
function stopSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    isPlaying = false;
    const icon = document.getElementById('slideshow-icon');
    if (icon) icon.textContent = '▶';
}

// 切换自动播放
function toggleSlideshow() {
    if (isPlaying) {
        stopSlideshow();
    } else {
        startSlideshow();
    }
}

// 切换幻灯片
function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (slides.length === 0) return;
    
    // 移除当前active
    slides[currentSlideIndex].classList.remove('active');
    indicators[currentSlideIndex].classList.remove('active');
    thumbnails[currentSlideIndex].classList.remove('active');
    
    // 计算新索引
    currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
    
    // 添加新的active
    slides[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
    thumbnails[currentSlideIndex].classList.add('active');
    
    // 滚动缩略图到可见区域
    thumbnails[currentSlideIndex].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'center'
    });
}

// 跳转到指定幻灯片
function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    const direction = index - currentSlideIndex;
    changeSlide(direction);
    
    // 重置自动播放
    if (isPlaying) {
        startSlideshow();
    }
}

// 下载故事簿
function downloadStory(story, photos) {
    // 创建HTML内容
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的旅行故事</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .story { background: white; padding: 40px; border-radius: 10px; margin-bottom: 30px; }
        .story-title { font-size: 28px; font-weight: bold; margin-bottom: 20px; color: #667eea; }
        .story-content { line-height: 1.8; font-size: 16px; color: #333; white-space: pre-wrap; }
        .gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .gallery img { width: 100%; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="story">
        <div class="story-title">✨ 我的旅行故事</div>
        <div class="story-content">${story}</div>
    </div>
    <div class="gallery">
        ${photos.map((p, i) => `<img src="${p.data}" alt="照片${i+1}">`).join('')}
    </div>
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-story-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ 故事簿已保存！');
}

// 分享故事
async function shareStory(story) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: '我的旅行故事',
                text: story
            });
        } catch (err) {
            console.log('分享取消');
        }
    } else {
        navigator.clipboard.writeText(story).then(() => {
            alert('✅ 故事已复制到剪贴板！');
        }).catch(() => {
            alert('❌ 复制失败');
        });
    }
}

// 准备照片数据用于API调用
async function preparePhotosForAPI(photos) {
    const promises = photos.map(photo => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    data: reader.result,
                    filename: photo.file.name
                });
            };
            reader.readAsDataURL(photo.file);
        });
    });
    
    return await Promise.all(promises);
}

// 重新开始
function restart() {
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
