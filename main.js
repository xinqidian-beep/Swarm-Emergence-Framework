// main.js - 涌现系统主控总线（纯净可视化视图）
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
    let logMsg = `--- Tick ${currentTick} ---\n`;

    // 1. 【环境场计算】全局场压强聚合
    const totalAmbientEnergy = agents.reduce((acc, a) => {
        const isSpeaking = a.currentDialogue && a.currentDialogue !== "...";
        return acc + (isSpeaking ? 1.2 : 0.2);
    }, 0) / (agents.length || 1);

    // 2. 【分布式并发激发】流经四元分形闭环流水线
    agents = await Promise.all(agents.map(agent => {
        const sensoryPacket = {
            ...agent,
            tick: currentTick,
            ambientEnergy: totalAmbientEnergy
        };
        return runFractalPipeline(sensoryPacket);
    }));

    // 3. 【控制台可视化呈现（百分之百规避模板语法混淆）】
    agents.forEach(agent => {
        const name = String(agent.name || "未知").padEnd(6, ' ');
        const pVal = Number(agent.physique || 0).toFixed(2);
        const sVal = Number(agent.stance || 0).toFixed(2);
        const rVal = Number(agent.resonance || 0).toFixed(2);
        
        logMsg += `  * 实体: \({name} | 体质(P):\){pVal} | 立场(S): \({sVal} | 谐振(R):\){rVal}\n`;
        logMsg += `    └─ 涌现台词: "${agent.currentDialogue || '...'}"\n`;
    });

    console.log(logMsg);

    // 4. 【时空持久化落盘】
    const stateData = {
        tick: currentTick,
        timestamp: new Date().toISOString(),
        ambientEnergyField: totalAmbientEnergy,
        agents: agents
    };
    fs.writeFileSync(path.join(__dirname, 'world_state.json'), JSON.stringify(stateData, null, 2), 'utf8');
}

setInterval(runTick, config.tickIntervalMs);