// core/modules/organicNarrative.js - 彻底告别指令式的自然融合转译
function buildOrganicPrompt(agentPacket) {
    const { name, region, profession, memoryBuffer, phenomenon } = agentPacket;

    // 获取最近的一条记忆回响（如果有的话）
    let recentMemory = "";
    if (memoryBuffer && memoryBuffer.length > 0) {
        recentMemory = `不久前，耳边似乎还回响着：“${memoryBuffer[0].text}”。`;
    }

    // 用沉浸式的小说笔触替代冰冷的指令拼接
    return `【时空背景：${region}】\n` +
           `这里是属于\({profession}\){name}的世界。${phenomenon}\n` +
           `${recentMemory}\n` +
           `此刻，一阵风吹过，${name}微微闭上双眼，心中自然流淌出的下一句话是：`;
}

module.exports = { buildOrganicPrompt };