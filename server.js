// server.js - 去中心化 Actor 集群与 Skyrim 游戏的桥接观测网关 (Production Ready)
const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const { WorldBus } = require('./core/bus/WorldBus');
const { SovereignAgent } = require('./core/actor/SovereignAgent');
const worldConfig = require('./config/worldConfig.json');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/**
 * 【Skyrim 观测与交互网关总线】
 * 仅负责：内部信箱路由 + 将实体的局部输出（台词/快照）以标准化事件流推给外部游戏客户端。
 */
class SkyrimBridgeBus extends WorldBus {
    constructor() {
        super();
        this.wsClients = new Set();
    }

    registerWsClient(ws) {
        this.wsClients.add(ws);
        console.log('[Bridge Gateway] Skyrim Mod 客户端已安全联通。');
        ws.on('close', () => {
            this.wsClients.delete(ws);
            console.log('[Bridge Gateway] Skyrim Mod 客户端已断开。');
        });
    }

    // 重写 publish：实体发声时，内部同伴接收扰动 + 外部游戏侧接收局部事件
    publish(messagePacket) {
        // 1. 内部自治空间广播（同区域的其他 Actor 接收信箱扰动）
        super.publish(messagePacket);

        // 2. 外部游戏世界同步（遵循顾问原则：只输出局部台词事件，不泄露全局控制权）
        const payload = JSON.stringify({
            type: 'agent.speak',
            payload: {
                speaker: messagePacket.from,
                region: messagePacket.region,
                content: messagePacket.content
            },
            timestamp: Date.now()
        });

        for (const client of this.wsClients) {
            if (client.readyState === client.OPEN) {
                client.send(payload);
            }
        }
    }
}

// 1. 初始化世界总线
const worldBus = new SkyrimBridgeBus();

// 2. 从种子配置中孕育各个独立的 SovereignAgent 实例
const agentsMap = new Map();
worldConfig.entities.forEach(seed => {
    const agent = new SovereignAgent(seed, worldBus);
    agentsMap.set(seed.name, agent);
    
    // 异步点火各自的内生时钟（完全独立，不受网关或游戏强行 Tick 调度）
    agent.awaken().catch(err => {
        console.error(`[节点异常] ${seed.name} 崩溃:`, err);
    });
});

// 3. WebSocket 实时双向通信通道（接收游戏侧的局部刺激事件）
wss.on('connection', (ws) => {
    worldBus.registerWsClient(ws);

    ws.on('message', (rawMessage) => {
        try {
            const packet = JSON.parse(rawMessage.toString());
            // 契约格式校验: { type, target, region, payload }
            const { type, target, region, payload } = packet;
            console.log('[WebSocket 收到游戏刺激]', packet);

            if (type === 'world.stimulus') {
                if (target && agentsMap.has(target)) {
                    // 入站原则：绝不直接改状态，而是作为局部的私有刺激投入信箱
                    const agent = agentsMap.get(target);
                    agent.receiveMessage({
                        type: 'EXTERNAL_STIMULUS',
                        sender: payload?.sender || '游戏世界',
                        content: payload?.content || '环境发生了一次微弱扰动',
                        magnitude: payload?.magnitude || 0.3,
                        timestamp: Date.now()
                    });
                } else if (region) {
                    worldBus.publish({
                        from: payload?.sender || '环境',
                        region: region,
                        content: payload?.content || '区域发生环境波动'
                    });
                }
            }
        } catch (e) {
            console.error('[WebSocket] 解析游戏消息失败:', e);
        }
    });
});

// 4. HTTP POST 接口：供 Skyrim Papyrus 脚本安全调用的轻量事件通道
app.post('/api/skyrim/stimulus', (req, res) => {
    const { target, region, sender, content, magnitude } = req.body;
    console.log(`[HTTP 游戏刺激入站] 目标: ${target || '全局'} | 区域: ${region || '未知'} | 内容: ${content}`);

    if (target && agentsMap.has(target)) {
        const agent = agentsMap.get(target);
        // 严格遵循：入站事件必须先变成局部刺激进入私有信箱
        agent.receiveMessage({
            type: 'EXTERNAL_STIMULUS',
            sender: sender || '玩家',
            content: content || '玩家在附近进行了互动',
            magnitude: magnitude || 0.4,
            timestamp: Date.now()
        });
        return res.json({ success: true, message: `已将刺激安全投递至主权信箱: ${target}` });
    } else if (region) {
        worldBus.publish({
            from: sender || '玩家',
            region: region,
            content: content || '区域环境事件'
        });
        return res.json({ success: true, message: `已向区域 [${region}] 广播环境刺激` });
    }

    res.status(400).json({ success: false, error: '未找到指定的目标 NPC 或区域' });
});

// 5. 局部观测接口：只返回特定实体的轻量快照，绝不暴露出全局控制权
app.get('/api/agent/:name/snapshot', (req, res) => {
    const name = req.params.name;
    if (!agentsMap.has(name)) {
        return res.status(404).json({ success: false, error: '未找到该实体' });
    }
    const agent = agentsMap.get(name);
    res.json({
        success: true,
        snapshot: {
            name: agent.identity.name,
            profession: agent.identity.profession,
            region: agent.identity.region,
            dynamics: agent.dynamics,
            mailboxPendingCount: agent.mailbox.length
        }
    });
});

// 6. 启动服务器
const PORT = process.env.PORT || 7890;
server.listen(PORT, () => {
    console.log("==================================================");
    console.log(`  【Skyrim 观测与交互网关已安全点火】`);
    console.log(`  - 游戏事件入站端点 : POST http://localhost:${PORT}/api/skyrim/stimulus`);
    console.log(`  - 局部状态观测端点 : GET  http://localhost:${PORT}/api/agent/:name/snapshot`);
    console.log(`  - WebSocket 双向流 : ws://localhost:${PORT}`);
    console.log("==================================================");
});