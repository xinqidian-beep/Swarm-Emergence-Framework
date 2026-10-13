// testSkyrimClient.js - 模拟 Skyrim 客户端（Mod）与后端网关的双向交互
const WebSocket = require('ws');

const WS_URL = 'ws://localhost:7890';
const HTTP_URL = 'http://localhost:7890/api/skyrim/stimulus';

console.log('[Mock Skyrim Mod] 正在连接后端涌现网关...');
const ws = new WebSocket(WS_URL);

ws.on('open', async () => {
    console.log('[Mock Skyrim Mod] WebSocket 连接成功！正在监听局域实体发声...');

    // 模拟等待 2 秒后，玩家走到河木镇，对铁匠哈瓦尔发起第一次刺激
    setTimeout(async () => {
        console.log('\n[模拟游戏事件] 玩家走进河木镇，靠近铁匠哈瓦尔并递上一把破损的铁剑...');
        
        try {
            const response = await fetch(HTTP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target: '哈瓦尔',
                    region: '河木镇',
                    sender: '龙裔',
                    content: '嘿，哈瓦尔，能帮我把这把生锈的铁剑打磨一下吗？',
                    magnitude: 0.6
                })
            });
            const result = await response.json();
            console.log('[HTTP 响应]', result);
        } catch (err) {
            console.error('[HTTP 请求失败 - 确保 server.js 正在运行]:', err.message);
        }
    }, 2000);

    // 模拟 15 秒后，环境突变（暴风雪掠过荒野，米拉在荒野信箱中收到刺激）
    setTimeout(async () => {
        console.log('\n[模拟游戏事件] 荒野气温骤降，暴风雪突袭...');
        
        try {
            await fetch(HTTP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    region: '荒野',
                    sender: '自然天气',
                    content: '呼啸的寒风卷着冰雪掠过荒野，四周温度急剧下降。',
                    magnitude: 0.8
                })
            });
        } catch (err) {
            console.error('[HTTP 荒野广播失败]:', err.message);
        }
    }, 15000);
});

// 监听来自后端网关的实体局部输出（对应游戏中的头顶气泡 / TTS 触发）
ws.on('message', (data) => {
    try {
        const packet = JSON.parse(data.toString());
        if (packet.type === 'agent.speak') {
            const { speaker, region, content } = packet.payload;
            console.log(`\n💬 [游戏头顶气泡渲染] 区域 [${region}] 的 【${speaker}】 开口说话了:`);
            console.log(`   "${content}"\n`);
        }
    } catch (e) {
        console.error('[Mock Mod] 解析 WebSocket 消息出错:', e);
    }
});

ws.on('close', () => {
    console.log('[Mock Skyrim Mod] 与网关断开连接。');
});