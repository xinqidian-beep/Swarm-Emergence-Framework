// test_dynamics_stress.js
const { dynamicsModule } = require('./core/modules/dynamicsModule');

function runStressTest() {
    console.log("[压测开始] 正在启动 10,000 次无头物理动力学循环...");
    
    let agent = {
        name: "压力测试体",
        profession: "标本",
        region: "测试空间",
        physique: 4.8,     // 故意给一个接近边界的初始值
        stance: -4.9,      // 接近负向边界
        resonance: 0.0,
        intrinsicFactor: 0.1,
        memoryBuffer: [],
        currentDialogue: "测试极限状态下的物理阻尼与边界反弹。",
        ambientEnergy: 0.9
    };

    let minP = 0, maxP = 0, minS = 0, maxS = 0;
    let hasNan = false;

    for (let i = 0; i < 10000; i++) {
        agent = dynamicsModule(agent);

        // 检查是否出现 NaN 或无限大
        if (isNaN(agent.physique) || isNaN(agent.stance) || isNaN(agent.resonance)) {
            hasNan = true;
            console.error(`[严重错误] 在第 ${i} Tick 出现 NaN！`);
            break;
        }

        // 记录极值
        minP = Math.min(minP, agent.physique);
        maxP = Math.max(maxP, agent.physique);
        minS = Math.min(minS, agent.stance);
        maxS = Math.max(maxS, agent.stance);

        // 模拟对话轮转
        agent.currentDialogue = i % 2 === 0 ? "在孤独中寻找钢铁的力量。" : "守护平静的河流。";
    }

    console.log("----------------------------------------");
    console.log(`[压测完成] 状态摘要:`);
    console.log(`- 体质 P 范围: [${minP}, ${maxP}] (必须严格在 [-5, 5] 内)`);
    console.log(`- 立场 S 范围: [${minS}, ${maxS}] (必须严格在 [-5, 5] 内)`);
    console.log(`- 是否出现异常崩溃 (NaN): ${hasNan ? "是 ❌" : "否 ✔️"}`);
    console.log(`- 阻尼边界测试: ${maxP <= 5.0 && minP >= -5.0 ? "温和尾端收敛正常 ✔️" : "边界溢出 ❌"}`);
}

runStressTest();