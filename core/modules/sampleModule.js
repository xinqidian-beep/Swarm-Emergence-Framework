// core/modules/sampleModule.js - 局域采样与环境场对齐
function sampleModule(agentPacket) {
    // 严格遵循其内部规则：仅负责打包环境信息与当前感知输入
    return {
        ...agentPacket,
        sampledAt: Date.now()
    };
}

module.exports = { sampleModule };