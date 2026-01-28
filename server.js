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
    // OpenAI Sora 2 (推荐)
    sora: {
        endpoint: 'https://api.openai.com/v1/videos',
        token: process.env.OPENAI_API_KEY
    },
    // Kling AI (可选)
    kling: {
        endpoint: 'https://api.newapi.ai/api/ai-model/videos/kling/createklingimage2video',
        token: process.env.KLING_API_KEY
    },
    // Runway (可选)
    runway: {
        endpoint: 'https://api.runwayml.com/v1/gen2',
        token: process.env.RUNWAY_API_KEY
    },
    // 即梦AI (可选)
    jimeng: {
        endpoint: 'https://jimeng.api.volcengine.com/v1/video/generate',
        token: process.env.JIMENG_API_KEY
    }
};

// 选择使用的服务
const SELECTED_SERVICE = process.env.VIDEO_SERVICE || 'sora';

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
 * 调用Kling API生成视频
 */
async function generateVideoWithKling(imageBase64, prompt, config) {
    try {
        const response = await axios.post(
            VIDEO_API_CONFIG.kling.endpoint,
            {
                image: imageBase64,
                prompt: prompt,
                duration: 5, // 5秒视频
                mode: 'pro',
                aspect_ratio: '9:16', // 竖屏
                n: 1
            },
            {
                headers: {
                    'Authorization': `Bearer ${VIDEO_API_CONFIG.kling.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Kling API Error:', error.response?.data || error.message);
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
 * 健康检查
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        service: SELECTED_SERVICE,
        configured: !!VIDEO_API_CONFIG[SELECTED_SERVICE].token
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📹 视频生成服务: ${SELECTED_SERVICE}`);
    console.log(`🔑 API配置状态: ${VIDEO_API_CONFIG[SELECTED_SERVICE].token ? '✅ 已配置' : '❌ 未配置'}`);
});
