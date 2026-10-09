// main.js - 涌现系统主控总线（序时代谢与错峰流转版）
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
    currentDialogue: "...",
    cognitivePrompt: "（等待唤醒）"
}));

console.log(`[初始化] 涌现世界 "${config.worldName}" 启动成功！`);
console.log(`[范式架构] 自洽同构分形闭环 (Dynamics -> Translate -> Narrative -> Transmit -> Feedback)`);
console.log(`[心跳频率] 每 ${config.tickIntervalMs}ms 推进一次时空 Tick\n`);

async function runTick() {
    currentTick++;
    let logMsg = "--- Tick " + currentTick + " ---\n";

    // 1. 【环境场计算】全局场压强聚合
    const totalAmbientEnergy = agents.reduce((acc, a) => {
        const isSpeaking = a.currentDialogue && a.currentDialogue !== "...";
        return acc + (isSpeaking ? 1.2 : 0.2);
    }, 0) / (agents.length || 1);

    // 2. 【群落区域分组】构建空间社交网拓扑
    const regionalGroups = {};
    agents.forEach(agent => {
        const region = agent.region || "边境";
        if (!regionalGroups[region]) {
            regionalGroups[region] = [];
        }
        regionalGroups[region].push(agent);
    });

    // 3. 【时序错峰与串行交割】摒弃并发洪峰，改为按实体内部时序依次流经分形流水线
    const updatedAgents = [];
    for (const agent of agents) {
        const currentRegion = agent.region || "边境";
        const regionalPeers = regionalGroups[currentRegion] || [];
        
        const sensoryPacket = {
            ...agent,
            tick: currentTick,
            ambientEnergy: totalAmbientEnergy,
            regionalPeers: regionalPeers
        };
        
        try {
            // 串行推进流水线，给本地 Ollama 留出充裕的单线程推理时间，彻底杜绝超时雪崩
            const processedAgent = await runFractalPipeline(sensoryPacket);
            updatedAgents.push({
                ...processedAgent,
                ambientEnergy: totalAmbientEnergy
            });
        } catch (err) {
            console.error(`[主控调度异常] 实体 ${agent.name} 本轮时空交割失败:`, err.message);
            updatedAgents.push({
                ...agent,
                ambientEnergy: totalAmbientEnergy
            });
        }
    }
    agents = updatedAgents;

    // 4. 【控制台可视化呈现】双层白盒透传输出
    agents.forEach(agent => {        
        logMsg += "  * 实体: " + agent.name + " (" + agent.profession + " @ " + agent.region + ")\n" +
              "    [P: " + Number(agent.physique).toFixed(1) + 
              " | S: " + Number(agent.stance).toFixed(1) + 
              " | R: " + Number(agent.resonance).toFixed(1) + 
              " | 场压: " + Number(agent.ambientEnergy).toFixed(2) + "]\n" +
              "    ├─ [DeepSeek 状态转译]: \"" + (agent.cognitivePrompt || "（静默区）") + "\"\n" +
              "    └─ [Qwen 具现化台词]: \"" + (agent.currentDialogue || "...") + "\"\n";
    });
    console.log(logMsg);

    // 5. 【时空持久化落盘】
    const stateData = {
        tick: currentTick,
        timestamp: new Date().toISOString(),
        ambientEnergyField: totalAmbientEnergy,
        agents: agents
    };
    fs.writeFileSync(path.join(__dirname, 'world_state.json'), JSON.stringify(stateData, null, 2), 'utf8');
}

setInterval(runTick, config.tickIntervalMs);