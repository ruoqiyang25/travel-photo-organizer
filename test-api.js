const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🧪 开始测试 Kling API...\n');

// 1. 检查配置
console.log('📋 检查配置:');
console.log('  VIDEO_SERVICE:', process.env.VIDEO_SERVICE);
console.log('  KLING_API_KEY:', process.env.KLING_API_KEY ? '✅ 已配置' : '❌ 未配置');
console.log('  KLING_SECRET_KEY:', process.env.KLING_SECRET_KEY ? '✅ 已配置' : '❌ 未配置');
console.log('');

if (!process.env.KLING_API_KEY) {
    console.error('❌ 错误: KLING_API_KEY 未配置');
    console.log('请在 .env 文件中配置 KLING_API_KEY');
    process.exit(1);
}

// 2. 测试本地API健康检查
async function testHealthCheck() {
    console.log('🔍 测试 1: 健康检查端点');
    try {
        const response = await axios.get('http://localhost:3000/api/health');
        console.log('  状态:', response.status);
        console.log('  响应:', JSON.stringify(response.data, null, 2));
        console.log('  ✅ 健康检查通过\n');
        return true;
    } catch (error) {
        console.log('  ❌ 健康检查失败:', error.message);
        console.log('  提示: 请确保服务器正在运行 (npm start)\n');
        return false;
    }
}

// 3. 测试视频生成API（使用测试图片）
async function testVideoGeneration() {
    console.log('🎬 测试 2: 视频生成端点');
    
    // 创建一个简单的测试图片base64
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const testData = {
        photos: [{
            data: testImageBase64,
            filename: 'test.png'
        }],
        config: {
            title: 'API测试',
            style: 'vlog',
            music: 'peaceful',
            addVoiceover: false,
            addCaptions: true
        }
    };
    
    try {
        console.log('  发送请求到 /api/generate-video...');
        const response = await axios.post(
            'http://localhost:3000/api/generate-video',
            testData,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );
        
        console.log('  状态:', response.status);
        console.log('  响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data.taskId) {
            console.log('  ✅ 视频生成任务已创建');
            console.log('  📝 任务ID:', response.data.taskId);
            console.log('  ⏱️  预计时间:', response.data.estimatedTime, '秒');
            console.log('  🎨 使用服务:', response.data.service);
            return response.data.taskId;
        } else {
            console.log('  ⚠️  响应中没有taskId');
            return null;
        }
    } catch (error) {
        console.log('  ❌ 视频生成请求失败');
        if (error.response) {
            console.log('  状态码:', error.response.status);
            console.log('  错误信息:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('  错误:', error.message);
        }
        return null;
    }
}

// 4. 测试Kling API直接调用（如果提供了真实的API端点）
async function testKlingAPIDirect() {
    console.log('\n🚀 测试 3: 直接调用 Kling API');
    console.log('  注意: 这需要真实的Kling API端点和有效的密钥');
    
    // Kling API的真实端点（需要确认）
    const klingEndpoint = 'https://api.klingai.com/v1/videos/image2video';
    
    // 创建测试请求
    const testRequest = {
        model_name: 'kling-v1',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        prompt: '测试视频生成',
        duration: 5,
        mode: 'std'
    };
    
    try {
        console.log('  发送请求到 Kling API...');
        console.log('  端点:', klingEndpoint);
        console.log('  密钥:', process.env.KLING_API_KEY.substring(0, 10) + '...');
        
        const response = await axios.post(
            klingEndpoint,
            testRequest,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.KLING_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('  ✅ Kling API 调用成功!');
        console.log('  响应:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.log('  ⚠️  Kling API 调用失败 (可能是测试环境限制)');
        if (error.response) {
            console.log('  状态码:', error.response.status);
            console.log('  错误:', error.response.data);
        } else {
            console.log('  错误:', error.message);
        }
        console.log('  说明: 这可能是正常的，因为我们使用的是测试数据');
        return false;
    }
}

// 运行所有测试
async function runAllTests() {
    console.log('=' .repeat(60));
    console.log('🧪 Travel Photo Organizer - API 测试套件');
    console.log('=' .repeat(60));
    console.log('');
    
    const results = {
        health: false,
        videoGen: false,
        klingDirect: false
    };
    
    // 测试1: 健康检查
    results.health = await testHealthCheck();
    
    if (!results.health) {
        console.log('\n❌ 服务器未运行，请先启动服务器:');
        console.log('   cd /Users/ruoqi/Desktop/hackathon');
        console.log('   npm start');
        console.log('');
        return;
    }
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试2: 视频生成
    const taskId = await testVideoGeneration();
    results.videoGen = !!taskId;
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试3: 直接调用Kling API
    results.klingDirect = await testKlingAPIDirect();
    
    // 总结
    console.log('\n' + '=' .repeat(60));
    console.log('📊 测试结果总结');
    console.log('=' .repeat(60));
    console.log('');
    console.log('  健康检查:', results.health ? '✅ 通过' : '❌ 失败');
    console.log('  视频生成:', results.videoGen ? '✅ 通过' : '❌ 失败');
    console.log('  Kling API:', results.klingDirect ? '✅ 通过' : '⚠️  需要验证');
    console.log('');
    
    if (results.health && results.videoGen) {
        console.log('🎉 基础功能测试通过！');
        console.log('');
        console.log('💡 下一步:');
        console.log('  1. 在浏览器访问: http://localhost:3000');
        console.log('  2. 上传真实照片进行测试');
        console.log('  3. 查看视频生成效果');
        console.log('');
    } else {
        console.log('⚠️  部分测试未通过，请检查配置');
        console.log('');
    }
}

// 执行测试
runAllTests().catch(error => {
    console.error('💥 测试执行出错:', error.message);
    process.exit(1);
});
