// core/engine/tickEngine.js
const { sampleModule } = require('../modules/sampleModule');
const { dynamicsModule } = require('../modules/dynamicsModule');
const { computeModule } = require('../modules/computeModule');
const { dialogueModule } = require('../modules/transmitModule');

async function runTick(worldState, tickCount) {
    console.log(`\n--- Tick ${tickCount} ---`);

    // 1. 【群落分区域感知】：按实体所在的 region 进行空间分组
    const regionalGroups = {};
    for (let agent of worldState.agents) {
        const region = agent.region || "边境";
        if (!regionalGroups[region]) {
            regionalGroups[region] = [];
        }
        regionalGroups[region].push(agent);
    }

    // 2. 依次驱动每一个实体的生命闭环
    for (let agent of worldState.agents) {
        try {
            // 四元分形闭环推进
            let packet = await sampleModule(agent);
            packet = await dynamicsModule(packet);
            packet = await computeModule(packet);

            // 获取当前实体所在区域的同伴，注入多向感知
            const currentRegion = agent.region || "边境";
            const regionalPeers = regionalGroups[currentRegion] || [];
            
            packet = await dialogueModule(packet, regionalPeers);

            // 3. 【核心新增：记忆回响闭环】
            // 将刚说出口的台词压入内存缓冲区，作为下一次 Tick 的历史基因
            if (packet.currentDialogue && packet.currentDialogue !== "...") {
                if (!packet.memoryBuffer) packet.memoryBuffer = [];
                packet.memoryBuffer.unshift({
                    text: packet.currentDialogue,
                    timestamp: Date.now()
                });
                // 维持记忆容量上限，防止无限膨胀
                if (packet.memoryBuffer.length > 5) {
                    packet.memoryBuffer.pop();
                }
            }

            // 4. 将计算后的临时 packet 同步回全局世界状态的实体引用中
            Object.assign(agent, packet);

            // 5. 格式化控制台输出
            const pVal = Number(agent.physique || 5.0).toFixed(1);
            const sVal = Number(agent.stance || 0.0).toFixed(1);
            const rVal = Number(agent.resonance || 5.0).toFixed(1);
            
            console.log(`  * 实体: \({agent.name} (\){agent.profession} @ \({agent.region}) | 体质(P):\){pVal} | 立场(S): \({sVal} | 谐振(R):\){rVal}`);
            console.log(`    └─ 涌现台词: "${agent.currentDialogue}"`);

        } catch (err) {
            console.error(`  * 实体 \({agent.name || '未知'} 在 Tick\){tickCount} 运行时异常:`, err.message);
        }
    }
}

module.exports = { runTick };