// main.js - 涌现系统主控总线（纯净可视化视图 + 区域感知 + 记忆回响）
const fs = require('fs');
const path = require('path');
const { runFractalPipeline } = require('./core/fractalPipeline');

const configPath = path.join(__dirname, 'config', 'worldConfig.json');
if (!fs.existsSync(configPath)) {
    console.error("错误：找不到配置文件 config/worldConfig.json");
    process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

let currentTick = 0;
let agents = config.initialAgents.map(a => ({ 
    ...a, 
    ambientEnergy: 0.5, 
    memoryBuffer: [],
    currentDialogue: "..." 
}));

console.log(`[初始化] 涌现世界 "${config.worldName}" 启动成功！`);
console.log(`[范式架构] 四元分形闭环 (Sample -> Dynamics -> Compute -> Transmit)`);
console.log(`[心跳频率] 每 ${config.tickIntervalMs}ms 推进一次时空 Tick\n`);

async function runTick() {
    currentTick++;
    let logMsg = "--- Tick " + currentTick + " ---\n";

    // 1. 【环境场计算】全局场压强聚合
    const totalAmbientEnergy = agents.reduce((acc, a) => {
        const isSpeaking = a.currentDialogue && a.currentDialogue !== "...";
        return acc + (isSpeaking ? 1.2 : 0.2);
    }, 0) / (agents.length || 1);

    // 2. 【群落区域分组】构建空间社交网，用于同区域多向感知
    const regionalGroups = {};
    agents.forEach(agent => {
        const region = agent.region || "边境";
        if (!regionalGroups[region]) {
            regionalGroups[region] = [];
        }
        regionalGroups[region].push(agent);
    });

    // 3. 【分布式并发激发】流经四元分形闭环流水线
    agents = await Promise.all(agents.map(async agent => {
    const currentRegion = agent.region || "边境";
    const regionalPeers = regionalGroups[currentRegion] || [];
    
    const sensoryPacket = {
        ...agent,
        tick: currentTick,
        ambientEnergy: totalAmbientEnergy,
        regionalPeers: regionalPeers
    };
    
    const processedAgent = await runFractalPipeline(sensoryPacket);
    
    // 【关键修复】：确保全局场压正确回写到实体对象中，消灭 NaN
    return {
        ...processedAgent,
        ambientEnergy: totalAmbientEnergy
    };
}));
    // 4. 【记忆回响闭环】将实体最新吐出的台词沉淀入记忆缓冲区
    agents.forEach(agent => {
        if (agent.currentDialogue && agent.currentDialogue !== "...") {
            if (!agent.memoryBuffer) agent.memoryBuffer = [];
            agent.memoryBuffer.unshift({
                text: agent.currentDialogue,
                timestamp: Date.now()
            });
            // 保持记忆容量上限，防止无限膨胀
            if (agent.memoryBuffer.length > 5) {
                agent.memoryBuffer.pop();
            }
        }
    });

    // 5. 【控制台可视化呈现】（已修复模板字符串插值语法，确保数据正常渲染）
    agents.forEach(agent => {        
        logMsg += "  * 实体: " + agent.name + " (" + agent.profession + " @ " + agent.region + ")\n" +
              "    [P: " + Number(agent.physique).toFixed(1) + 
              " | S: " + Number(agent.stance).toFixed(1) + 
              " | R: " + Number(agent.resonance).toFixed(1) + 
              " | 场压: " + Number(agent.ambientEnergy).toFixed(2) + "]\n" +
              "    └─ 涌现台词: \"" + agent.currentDialogue + "\"\n";
    });
    console.log(logMsg);

    // 6. 【时空持久化落盘】
    const stateData = {
        tick: currentTick,
        timestamp: new Date().toISOString(),
        ambientEnergyField: totalAmbientEnergy,
        agents: agents
    };
    fs.writeFileSync(path.join(__dirname, 'world_state.json'), JSON.stringify(stateData, null, 2), 'utf8');
}

setInterval(runTick, config.tickIntervalMs);