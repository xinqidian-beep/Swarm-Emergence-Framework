const fs = require('fs');
const path = require('path');
const { generateDialogue } = require('./core/slotMatcher');

const configPath = path.join(__dirname, 'config', 'worldConfig.json');
if (!fs.existsSync(configPath)) {
    console.error("错误：找不到配置文件 config/worldConfig.json");
    process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

let currentTick = 0;
let agents = config.initialAgents.map(a => ({
    ...a,
    memory: [`初始状态加载`]
}));

console.log(`[初始化] 世界 "${config.worldName}" 启动成功！`);
console.log(`[初始化] 初始智能体数量: ${agents.length}`);
console.log(`[心跳频率] 每 ${config.tickIntervalMs}ms 执行一次 Tick 演化\n`);

function runTick() {
    currentTick++;
    let logMsg = `--- Tick ${currentTick} ---\n`;

    agents.forEach(agent => {
        agent.physique = Math.max(0, Math.min(10, agent.physique + (Math.random() - 0.5) * 1.0));
        agent.stance += (Math.random() - 0.5) * 0.3;
        agent.stance = Math.max(-1, Math.min(1, agent.stance));

        // 生成本地槽位规则台词
        const speech = generateDialogue(agent);

        logMsg += `  * 实体: \({agent.name.padEnd(6, ' ')} | 体质(P):\){agent.physique.toFixed(2)} | 立场(S): ${agent.stance.toFixed(2)}\n`;
        logMsg += `    └─ 状态台词: "${speech}"\n`;
    });

    console.log(logMsg);

    const stateData = {
        tick: currentTick,
        timestamp: new Date().toISOString(),
        agents: agents
    };
    
    const statePath = path.join(__dirname, 'world_state.json');
    fs.writeFileSync(statePath, JSON.stringify(stateData, null, 2), 'utf8');
}

setInterval(runTick, config.tickIntervalMs);