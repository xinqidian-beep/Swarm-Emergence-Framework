// core/fractalPipeline.js - 严格遵循“四元分形闭环拓扑”的宏观流水线
const { sampleModule } = require('./modules/sampleModule');
const { dynamicsModule } = require('./modules/dynamicsModule');
const { computeModule } = require('./modules/computeModule');
const { dialogueModule } = require('./modules/transmitModule'); // Transmit 阶段的语义投影

async function runFractalPipeline(agentPacket) {
    // 宏观全局规则：任何实体进入时空 Tick，必须严格依次历经四元分形闭环拓扑
    
    // 1. Sample 阶段：局域采样与环境场对齐
    let packet = sampleModule(agentPacket);

    // 2. Dynamics 阶段：纯数学动力学演化（体质、立场、谐振的内部规则）
    packet = dynamicsModule(packet);

    // 3. Compute 阶段：内生计算与记忆坍缩
    packet = computeModule(packet);

    // 4. Transmit 阶段：向外辐射，并调用 LLM 模块进行语义投影（尊重 LLM 的独立响应规则）
    packet = await dialogueModule(packet);

    return packet;
}

module.exports = { runFractalPipeline };