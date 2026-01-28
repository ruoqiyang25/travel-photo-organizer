#!/usr/bin/env python3
"""
直接测试 Kling AI API
不依赖本地服务器，直接调用Kling API
"""

import os
import sys
import requests
import json
import base64
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

print("=" * 60)
print("🧪 Kling AI API 直接测试")
print("=" * 60)
print()

# 获取API密钥
KLING_API_KEY = os.getenv('KLING_API_KEY')
KLING_SECRET_KEY = os.getenv('KLING_SECRET_KEY')

print("📋 配置检查:")
print(f"  KLING_API_KEY: {'✅ 已配置' if KLING_API_KEY else '❌ 未配置'}")
print(f"  KLING_SECRET_KEY: {'✅ 已配置' if KLING_SECRET_KEY else '❌ 未配置'}")
print()

if not KLING_API_KEY:
    print("❌ 错误: KLING_API_KEY 未配置")
    print("请在 .env 文件中配置 KLING_API_KEY")
    sys.exit(1)

# 创建一个简单的测试图片 (1x1 红色像素)
def create_test_image_base64():
    """创建一个1x1红色像素的PNG图片base64"""
    # 这是一个1x1红色像素的PNG
    return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

# 测试不同的API端点和认证方式
def test_kling_api_variant1():
    """测试方式1: Bearer Token认证"""
    print("🔍 测试 1: 使用 Bearer Token 认证")
    print()
    
    url = "https://api.klingai.com/v1/videos/image2video"
    
    headers = {
        "Authorization": f"Bearer {KLING_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model_name": "kling-v1",
        "image": f"data:image/png;base64,{create_test_image_base64()}",
        "prompt": "测试视频生成",
        "duration": 5,
        "mode": "std"
    }
    
    try:
        print(f"  请求URL: {url}")
        print(f"  认证方式: Bearer Token")
        print(f"  密钥前缀: {KLING_API_KEY[:10]}...")
        print()
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        print(f"  响应状态: {response.status_code}")
        print(f"  响应内容:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        print()
        
        if response.status_code == 200:
            print("  ✅ 测试成功!")
            return True
        else:
            print(f"  ❌ 测试失败 (状态码: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"  ❌ 请求异常: {str(e)}")
        return False

def test_kling_api_variant2():
    """测试方式2: API Key + Secret Key"""
    print("🔍 测试 2: 使用 Access Key + Secret Key")
    print()
    
    # Kling可能使用类似AWS的签名方式
    url = "https://api.klingai.com/v1/videos/image2video"
    
    headers = {
        "X-Api-Key": KLING_API_KEY,
        "X-Api-Secret": KLING_SECRET_KEY if KLING_SECRET_KEY else "",
        "Content-Type": "application/json"
    }
    
    data = {
        "model_name": "kling-v1",
        "image": f"data:image/png;base64,{create_test_image_base64()}",
        "prompt": "测试视频生成",
        "duration": 5,
        "mode": "std"
    }
    
    try:
        print(f"  请求URL: {url}")
        print(f"  认证方式: X-Api-Key + X-Api-Secret")
        print(f"  Access Key: {KLING_API_KEY[:10]}...")
        if KLING_SECRET_KEY:
            print(f"  Secret Key: {KLING_SECRET_KEY[:10]}...")
        print()
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        print(f"  响应状态: {response.status_code}")
        print(f"  响应内容:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        print()
        
        if response.status_code == 200:
            print("  ✅ 测试成功!")
            return True
        else:
            print(f"  ❌ 测试失败 (状态码: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"  ❌ 请求异常: {str(e)}")
        return False

def test_kling_api_variant3():
    """测试方式3: 可能的OpenAPI标准"""
    print("🔍 测试 3: OpenAPI标准格式")
    print()
    
    # 尝试不同的端点
    endpoints = [
        "https://api.klingai.com/v1/videos/image2video",
        "https://api.klingai.com/api/v1/videos/image2video",
        "https://klingai.kuaishou.com/api/v1/videos/image2video"
    ]
    
    for url in endpoints:
        print(f"  尝试端点: {url}")
        
        headers = {
            "Authorization": f"Bearer {KLING_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "Travel-Photo-Organizer/1.0"
        }
        
        data = {
            "image": f"data:image/png;base64,{create_test_image_base64()}",
            "prompt": "测试",
            "duration": 5
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            print(f"    状态: {response.status_code}")
            
            if response.status_code == 200:
                print(f"    ✅ 找到正确的端点!")
                print(f"    响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
                return True
            elif response.status_code != 404:
                print(f"    响应: {response.text[:200]}")
                
        except Exception as e:
            print(f"    请求失败: {str(e)}")
        
        print()
    
    print("  ❌ 所有端点测试失败")
    return False

def get_kling_api_info():
    """尝试获取API信息"""
    print("🔍 测试 4: 获取API信息")
    print()
    
    # 尝试获取API版本或文档
    info_endpoints = [
        "https://api.klingai.com/",
        "https://api.klingai.com/v1/",
        "https://api.klingai.com/v1/info",
        "https://api.klingai.com/health"
    ]
    
    for url in info_endpoints:
        try:
            print(f"  尝试: {url}")
            response = requests.get(url, timeout=5)
            print(f"    状态: {response.status_code}")
            if response.status_code == 200:
                print(f"    响应: {response.text[:500]}")
                print()
        except Exception as e:
            print(f"    失败: {str(e)}")
    
    print()

def main():
    """运行所有测试"""
    
    results = {
        "test1": False,
        "test2": False,
        "test3": False
    }
    
    # 运行测试
    print()
    results["test1"] = test_kling_api_variant1()
    
    print("-" * 60)
    print()
    
    results["test2"] = test_kling_api_variant2()
    
    print("-" * 60)
    print()
    
    results["test3"] = test_kling_api_variant3()
    
    print("-" * 60)
    print()
    
    # 尝试获取API信息
    get_kling_api_info()
    
    print("=" * 60)
    print("📊 测试结果总结")
    print("=" * 60)
    print()
    print(f"  Bearer Token认证: {'✅ 成功' if results['test1'] else '❌ 失败'}")
    print(f"  Access+Secret认证: {'✅ 成功' if results['test2'] else '❌ 失败'}")
    print(f"  多端点测试: {'✅ 成功' if results['test3'] else '❌ 失败'}")
    print()
    
    if any(results.values()):
        print("🎉 找到可用的API调用方式!")
    else:
        print("⚠️  所有测试都失败了")
        print()
        print("💡 可能的原因:")
        print("  1. API密钥无效或已过期")
        print("  2. API端点地址不正确")
        print("  3. 需要特殊的签名算法")
        print("  4. 账户余额不足")
        print("  5. API还未激活")
        print()
        print("📖 建议:")
        print("  1. 检查Kling官方文档")
        print("  2. 确认API密钥有效性")
        print("  3. 联系Kling客服")
        print("  4. 查看账户状态")
        print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  测试被用户中断")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n💥 测试出错: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
