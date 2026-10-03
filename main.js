// main.js - 涌现系统主控总线
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
let agents = config.initialAgents.map(a => ({ ...a }));

console.log(`[初始化] 涌现世界 "${config.worldName}" 启动成功！`);
console.log(`[范式架构] 四元分形闭环 (Sample -> Dynamics -> Compute -> Transmit)`);
console.log(`[心跳频率] 每 ${config.tickIntervalMs}ms 推进一次时空 Tick\n`);

async function runTick() {
    currentTick++;
    let logMsg = "--- Tick " + currentTick + " ---\n";

    // 宏观并行激发所有局域自治代理的分形流水线
    agents = await Promise.all(agents.map(agent => runFractalPipeline(agent)));

    agents.forEach(agent => {
        logMsg += "  * 实体: " + agent.name.padEnd(6, ' ') + 
                  " | 体质(P): " + agent.physique.toFixed(2) + 
                  " | 立场(S): " + agent.stance.toFixed(2) + 
                  " | 谐振(R): " + agent.resonance.toFixed(2) + "\n";
        logMsg += "    └─ 涌现台词: \"" + agent.currentDialogue + "\"\n";
    });

    console.log(logMsg);

    // 状态持久化写入
    const stateData = {
        tick: currentTick,
        timestamp: new Date().toISOString(),
        agents: agents
    };
    fs.writeFileSync(path.join(__dirname, 'world_state.json'), JSON.stringify(stateData, null, 2), 'utf8');
}

setInterval(runTick, config.tickIntervalMs);