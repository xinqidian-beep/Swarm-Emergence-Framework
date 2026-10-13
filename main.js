// main.js - 去中心化涌现世界的点火入口
const { WorldBus } = require('./core/bus/WorldBus');
const { SovereignAgent } = require('./core/actor/SovereignAgent');
const worldConfig = require('./config/worldConfig.json'); // 假设这里存放初始 NPC 种子配置

async function igniteSwarm() {
    console.log("==================================================");
    console.log("  【系统初始化】正在构建去中心化主权节点世界总线...");
    console.log("==================================================");

    // 1. 实例化空间消息总线
    const worldBus = new WorldBus();

    // 2. 从种子配置中孕育各个独立的 SovereignAgent
    // 每一个实体拥有完全独立的内存、独立的信箱、独立的心跳节拍
    const agents = worldConfig.entities.map(seed => {
        return new SovereignAgent(seed, worldBus);
    });

    console.log(`[世界就绪] 共 ${agents.length} 个主权节点已加载，开始独立点火运行...\n`);

    // 3. 异步“点火”：绝不使用 Promise.all 强行同步！
    // 每一个节点带着各自的初始相位和心跳，彻底走向独立异步生命。
    agents.forEach(agent => {
        agent.awaken().catch(err => {
            console.error(`[节点致命崩塌] ${agent.identity.name}:`, err);
        });
    });
}

igniteSwarm();