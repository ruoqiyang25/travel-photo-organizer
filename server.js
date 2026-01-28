const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// API配置 - 支持多个视频生成服务
const VIDEO_API_CONFIG = {
    // OpenAI Sora 2
    sora: {
        endpoint: 'https://api.openai.com/v1/videos',
        token: process.env.OPENAI_API_KEY
    },
    // Kling AI - 快手可灵（国内推荐）
    kling: {
        endpoint: 'https://api.klingai.com/v1/videos/image2video',
        token: process.env.KLING_API_KEY,
        name: '快手可灵',
        features: ['高质量', '支持文字', '快速生成']
    },
    // 即梦AI - 字节跳动（国内推荐）
    jimeng: {
        endpoint: 'https://open.volcengineapi.com/api/v1/video_generation',
        token: process.env.JIMENG_API_KEY,
        name: '即梦AI',
        features: ['电影级画质', '智能字幕', '旅游场景优化']
    },
    // 通义千问视频生成
    qwen: {
        endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation',
        token: process.env.QWEN_API_KEY,
        name: '通义千问',
        features: ['阿里云', '稳定可靠', '中文优化']
    },
    // Runway Gen-2
    runway: {
        endpoint: 'https://api.runwayml.com/v1/gen2',
        token: process.env.RUNWAY_API_KEY,
        name: 'Runway Gen-2',
        features: ['专业级', '电影质感']
    }
};

// 选择使用的服务
const SELECTED_SERVICE = process.env.VIDEO_SERVICE || 'kling';

/**
 * 生成视频提示词
 */
function generateVideoPrompt(photos, style, config) {
    const stylePrompts = {
        cinematic: {
            base: '电影级别的画质，平滑的摄像机运动，专业色彩校正，戏剧性的光线变化',
            transitions: ['缓慢推进', '优雅平移', '景深变化', '光线渐变']
        },
        vlog: {
            base: '第一人称视角，自然的手持感，真实的色彩，温暖的氛围',
            transitions: ['快速切换', '跳跃式运动', '自然晃动', '明亮色调']
        },
        memories: {
            base: '怀旧滤镜，柔和的光晕效果，梦幻般的氛围，温馨的回忆感',
            transitions: ['淡入淡出', '柔和模糊', '时光流逝', '梦幻光效']
        },
        dynamic: {
            base: '快节奏剪辑，动态摄像机运动，高对比度，充满活力',
            transitions: ['快速缩放', '旋转运动', '强烈对比', '能量爆发']
        }
    };

    const selectedStyle = stylePrompts[style] || stylePrompts.cinematic;
    
    return {
        base: selectedStyle.base,
        transition: selectedStyle.transitions[Math.floor(Math.random() * selectedStyle.transitions.length)],
        mood: getMoodFromConfig(config)
    };
}

/**
 * 从配置获取情绪
 */
function getMoodFromConfig(config) {
    const moodMap = {
        peaceful: '宁静祥和，放松的氛围',
        adventure: '冒险刺激，充满活力',
        romantic: '浪漫温馨，柔和梦幻',
        energetic: '充满能量，激情四射'
    };
    return moodMap[config.music] || moodMap.peaceful;
}

/**
 * 调用OpenAI Sora API生成视频
 */
async function generateVideoWithSora(imageFile, prompt, config) {
    try {
        const FormData = require('form-data');
        const formData = new FormData();
        
        // 添加提示词
        formData.append('prompt', prompt);
        formData.append('model', 'sora-2-pro'); // 或 'sora-2'
        formData.append('size', '1280x720'); // 1280x720 或 1920x1080
        formData.append('seconds', '5'); // 视频时长（秒）
        
        // 如果提供了图像参考（图生视频）
        if (imageFile) {
            formData.append('input_reference', imageFile, {
                contentType: 'image/jpeg',
                filename: 'reference.jpg'
            });
        }

        const response = await axios.post(
            VIDEO_API_CONFIG.sora.endpoint,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${VIDEO_API_CONFIG.sora.token}`,
                    ...formData.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Sora API Error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 调用Kling API生成视频（快手可灵）
 */
async function generateVideoWithKling(imageBase64, prompt, config, caption) {
    try {
        const response = await axios.post(
            VIDEO_API_CONFIG.kling.endpoint,
            {
                model_name: 'kling-v1',
                image: imageBase64,
                prompt: prompt,
                negative_prompt: '模糊,低质量,变形',
                cfg_scale: 0.5,
                duration: 5, // 5秒视频
                mode: 'pro', // std 或 pro
                aspect_ratio: '16:9', // 适合旅游视频
                // 添加文字叠加
                text_overlay: config.addCaptions ? {
                    text: caption,
                    position: 'bottom',
                    font_size: 24,
                    font_color: '#FFFFFF',
                    background: 'rgba(0,0,0,0.6)',
                    animation: 'fade_in'
                } : null
            },
            {
                headers: {
                    'Authorization': `Bearer ${VIDEO_API_CONFIG.kling.token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );
        return response.data;
    } catch (error) {
        console.error('Kling API Error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 调用即梦AI生成视频（字节跳动）
 */
async function generateVideoWithJimeng(imageBase64, prompt, config, caption) {
    try {
        const response = await axios.post(
            VIDEO_API_CONFIG.jimeng.endpoint,
            {
                req_key: `jimeng_${Date.now()}`,
                prompt: prompt,
                model_version: 'v2.5',
                image: imageBase64,
                video_duration: 5,
                video_quality: 'high',
                aspect_ratio: '16:9',
                // 智能字幕
                subtitle: config.addCaptions ? {
                    enabled: true,
                    text: caption,
                    style: 'modern',
                    position: 'bottom',
                    font_family: 'PingFang SC',
                    animation: 'smooth'
                } : null
            },
            {
                headers: {
                    'Authorization': `Bearer ${VIDEO_API_CONFIG.jimeng.token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );
        return response.data;
    } catch (error) {
        console.error('Jimeng API Error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 调用通义千问视频生成API
 */
async function generateVideoWithQwen(imageBase64, prompt, config, caption) {
    try {
        const response = await axios.post(
            VIDEO_API_CONFIG.qwen.endpoint,
            {
                model: 'qwen-vl-video',
                input: {
                    image_url: imageBase64,
                    prompt: prompt,
                    text_overlay: config.addCaptions ? caption : null
                },
                parameters: {
                    duration: 5,
                    fps: 24,
                    resolution: '1280x720',
                    style: 'travel_vlog'
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${VIDEO_API_CONFIG.qwen.token}`,
                    'Content-Type': 'application/json',
                    'X-DashScope-Async': 'enable'
                },
                timeout: 60000
            }
        );
        return response.data;
    } catch (error) {
        console.error('Qwen API Error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 检查Sora视频生成状态
 */
async function checkSoraVideoStatus(videoId) {
    try {
        const response = await axios.get(
            `https://api.openai.com/v1/videos/${videoId}`,
            {
                headers: {
                    'Authorization': `Bearer ${VIDEO_API_CONFIG.sora.token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Check Sora status error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 下载Sora生成的视频
 */
async function downloadSoraVideo(videoId) {
    try {
        const response = await axios.get(
            `https://api.openai.com/v1/videos/${videoId}/content`,
            {
                headers: {
                    'Authorization': `Bearer ${VIDEO_API_CONFIG.sora.token}`
                },
                responseType: 'stream'
            }
        );
        return response.data;
    } catch (error) {
        console.error('Download Sora video error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 检查视频生成状态（通用）
 */
async function checkVideoStatus(taskId, service = 'sora') {
    try {
        if (service === 'sora') {
            return await checkSoraVideoStatus(taskId);
        }
        
        const response = await axios.get(
            `${VIDEO_API_CONFIG[service].endpoint}/task/${taskId}`,
            {
                headers: {
                    'Authorization': `Bearer ${VIDEO_API_CONFIG[service].token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Check status error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 生成旁白文案
 */
function generateNarration(photos, style) {
    const narrativeStyles = {
        cinematic: [
            '这是一段难忘的旅程',
            '每个瞬间都值得珍藏',
            '在路上，遇见最好的自己',
            '旅行的意义，在于发现'
        ],
        vlog: [
            '跟我一起看看这里',
            '今天的旅行超级精彩',
            '这个地方太美了',
            '分享给你们这些美好瞬间'
        ],
        memories: [
            '那些美好的回忆',
            '时光荏苒，唯有记忆永存',
            '每一张照片都是一个故事',
            '珍藏这些温暖的时刻'
        ],
        dynamic: [
            '出发！探索未知',
            '感受这份激情与活力',
            '每一刻都充满惊喜',
            '这就是旅行的魅力'
        ]
    };

    const narrations = narrativeStyles[style] || narrativeStyles.cinematic;
    return narrations[Math.floor(Math.random() * narrations.length)];
}

/**
 * 为每张照片生成智能文字描述
 */
function generatePhotoCaption(photoIndex, totalPhotos, style, videoTitle) {
    const captionTemplates = {
        cinematic: [
            `${videoTitle || '旅行回忆'} - 第${photoIndex + 1}章`,
            `那些美好时光 · ${photoIndex + 1}/${totalPhotos}`,
            `珍藏的瞬间 #${photoIndex + 1}`,
            `旅途中的故事 (${photoIndex + 1}/${totalPhotos})`
        ],
        vlog: [
            `Day ${photoIndex + 1} 📍`,
            `打卡第${photoIndex + 1}站 ✨`,
            `今天也是元气满满的一天 (${photoIndex + 1}/${totalPhotos})`,
            `分享给你们 ${photoIndex + 1}/${totalPhotos} 💕`
        ],
        memories: [
            `回忆 · ${photoIndex + 1}`,
            `时光胶囊 ${photoIndex + 1}/${totalPhotos}`,
            `定格这一刻 ⏰`,
            `${videoTitle || '那些年'} · ${photoIndex + 1}`
        ],
        dynamic: [
            `冒险第${photoIndex + 1}站 🚀`,
            `探索继续 ${photoIndex + 1}/${totalPhotos}`,
            `GO! ${photoIndex + 1}/${totalPhotos} 💪`,
            `精彩继续 · ${photoIndex + 1}`
        ]
    };

    const templates = captionTemplates[style] || captionTemplates.cinematic;
    return templates[photoIndex % templates.length];
}

/**
 * 生成完整的旅游故事视频文案
 */
function generateTravelStory(photos, config) {
    const { videoTitle, style } = config;
    
    // 为每张照片生成文字
    const photoCaptions = photos.map((photo, index) => ({
        photoIndex: index,
        caption: generatePhotoCaption(index, photos.length, style, videoTitle),
        timestamp: index * 5 // 每张照片5秒
    }));

    // 生成开场白
    const openingText = videoTitle || '我的旅行故事';
    
    // 生成结尾文字
    const closingTexts = {
        cinematic: '未完待续...',
        vlog: '谢谢观看 ❤️',
        memories: '珍惜每一刻 ✨',
        dynamic: '下次见！🎉'
    };
    const closingText = closingTexts[style] || closingTexts.memories;

    return {
        opening: openingText,
        captions: photoCaptions,
        closing: closingText,
        totalDuration: photos.length * 5
    };
}

// API路由

/**
 * 生成视频 - 主接口
 */
app.post('/api/generate-video', async (req, res) => {
    try {
        const { photos, config } = req.body;

        if (!photos || photos.length === 0) {
            return res.status(400).json({ error: '没有提供照片' });
        }

        // 检查API配置
        if (!VIDEO_API_CONFIG[SELECTED_SERVICE].token) {
            return res.status(500).json({ 
                error: 'API密钥未配置',
                message: `请在.env文件中设置${SELECTED_SERVICE.toUpperCase()}_API_KEY`
            });
        }

        // 生成视频提示词
        const promptData = generateVideoPrompt(photos, config.style, config);
        const fullPrompt = `${promptData.base}. ${promptData.transition}. ${promptData.mood}. 旅行视频，画面流畅自然。`;

        console.log(`使用 ${SELECTED_SERVICE} 服务生成视频`);
        console.log(`提示词: ${fullPrompt}`);

        // 如果使用Sora，直接调用API
        if (SELECTED_SERVICE === 'sora') {
            try {
                // 转换第一张照片为Buffer（用于图生视频）
                // photos数组中每个元素是对象: { data: base64String, filename: string }
                const photoData = photos[0].data || photos[0];
                const base64Data = photoData.replace(/^data:image\/\w+;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                
                // 调用Sora API
                const soraResult = await generateVideoWithSora(imageBuffer, fullPrompt, config);
                
                res.json({
                    taskId: soraResult.id,
                    status: 'processing',
                    message: 'Sora视频生成任务已创建',
                    prompt: fullPrompt,
                    narration: config.addVoiceover ? generateNarration(photos, config.style) : null,
                    estimatedTime: 60, // Sora大约需要1分钟
                    service: 'sora'
                });
                
            } catch (error) {
                console.error('Sora API调用失败:', error);
                return res.status(500).json({
                    error: 'Sora视频生成失败',
                    message: error.message,
                    details: error.response?.data
                });
            }
        } else {
            // 其他服务使用异步处理
            const response = {
                taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                status: 'processing',
                message: '视频生成任务已创建',
                prompt: fullPrompt,
                narration: config.addVoiceover ? generateNarration(photos, config.style) : null,
                estimatedTime: photos.length * 30,
                service: SELECTED_SERVICE
            };

            // 异步生成视频
            processVideoGeneration(photos, fullPrompt, config, response.taskId);

            res.json(response);
        }

    } catch (error) {
        console.error('Generate video error:', error);
        res.status(500).json({ 
            error: '视频生成失败', 
            message: error.message 
        });
    }
});

/**
 * 查询视频生成状态
 */
app.get('/api/video-status/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const service = req.query.service || SELECTED_SERVICE;
        
        // 如果是Sora服务，查询真实状态
        if (service === 'sora') {
            const soraStatus = await checkSoraVideoStatus(taskId);
            
            // Sora返回的状态映射
            const statusMap = {
                'in_progress': 'processing',
                'completed': 'completed',
                'failed': 'failed'
            };
            
            res.json({
                taskId,
                status: statusMap[soraStatus.status] || 'processing',
                progress: soraStatus.status === 'completed' ? 100 : 50,
                videoUrl: soraStatus.status === 'completed' ? `/api/video/download/${taskId}?service=sora` : null,
                message: soraStatus.status === 'completed' ? '视频生成完成' : '正在生成视频...',
                service: 'sora'
            });
        } else {
            // 其他服务返回模拟数据
            const status = {
                taskId,
                status: 'completed',
                progress: 100,
                videoUrl: '/api/video/download/' + taskId,
                message: '视频生成完成',
                service
            };
            res.json(status);
        }

    } catch (error) {
        console.error('Check status error:', error);
        res.status(500).json({ error: '查询状态失败', message: error.message });
    }
});

/**
 * 下载生成的视频
 */
app.get('/api/video/download/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const service = req.query.service || SELECTED_SERVICE;
        
        if (service === 'sora') {
            // 下载Sora生成的视频
            const videoStream = await downloadSoraVideo(taskId);
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="travel-video-${taskId}.mp4"`);
            videoStream.pipe(res);
        } else {
            res.status(404).json({ error: '视频未找到' });
        }
        
    } catch (error) {
        console.error('Download video error:', error);
        res.status(500).json({ error: '下载视频失败', message: error.message });
    }
});

/**
 * 异步处理视频生成（后台任务）
 */
async function processVideoGeneration(photos, prompt, config, taskId) {
    try {
        console.log(`开始处理任务 ${taskId}`);
        console.log(`照片数量: ${photos.length}`);
        console.log(`提示词: ${prompt}`);

        // 这里实现实际的视频生成逻辑
        // 1. 对每张照片调用图生视频API
        // 2. 等待所有视频片段生成完成
        // 3. 使用FFmpeg合并视频片段
        // 4. 添加背景音乐和字幕
        // 5. 如果需要，添加AI配音
        
        for (let i = 0; i < photos.length; i++) {
            console.log(`处理照片 ${i + 1}/${photos.length}`);
            
            // 调用视频生成API
            // const videoSegment = await generateVideoWithKling(photos[i], prompt, config);
            
            // 存储视频片段
            // await saveVideoSegment(taskId, i, videoSegment);
        }

        // 合并视频
        // await mergeVideoSegments(taskId, photos.length, config);

        console.log(`任务 ${taskId} 完成`);

    } catch (error) {
        console.error(`任务 ${taskId} 失败:`, error);
        // 更新任务状态为失败
    }
}

/**
 * 健康检查 - 根路径
 */
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        service: SELECTED_SERVICE,
        configured: !!VIDEO_API_CONFIG[SELECTED_SERVICE].token,
        timestamp: new Date().toISOString()
    });
});

/**
 * 健康检查 - API路径
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        service: SELECTED_SERVICE,
        configured: !!VIDEO_API_CONFIG[SELECTED_SERVICE].token,
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🚀 服务器运行在 http://${HOST}:${PORT}`);
    console.log(`📹 视频生成服务: ${SELECTED_SERVICE}`);
    console.log(`🔑 API配置状态: ${VIDEO_API_CONFIG[SELECTED_SERVICE].token ? '✅ 已配置' : '❌ 未配置'}`);
});
