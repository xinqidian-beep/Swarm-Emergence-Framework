// core/modules/computeModule.js - 内生计算与记忆坍缩
function computeModule(agentPacket) {
    const memoryBuffer = agentPacket.memoryBuffer || [];
    
    // 内部逻辑规则：当环境发生波动时，触发记忆碎片的内生演化
    if (Math.random() < 0.35) {
        memoryBuffer.push({
            tick: agentPacket.tick || 0,
            text: `集群环境压强波动，当前共鸣度: ${(agentPacket.resonance || 0.5).toFixed(2)}`
        });
        if (memoryBuffer.length > 5) memoryBuffer.shift(); // 维持固定容量的短期记忆
    }

    return {
        ...agentPacket,
        memoryBuffer
    };
}

module.exports = { computeModule };