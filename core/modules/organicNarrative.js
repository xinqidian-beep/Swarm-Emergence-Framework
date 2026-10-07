// core/modules/organicNarrative.js - 叙事织网器
// 负责将 DeepSeek 转译出的潜意识感知与环境、身份融合成无缝的文学前置背景

function buildOrganicPrompt(agentPacket) {
    const { name, profession, region, phenomenon } = agentPacket;

    return `[当前所在区域: ${region}]
[角色身份: ${profession} - ${name}]
[身体直觉与潜意识流动]
${phenomenon || "周遭一片寂静，空气中弥漫着未知的气息。"}

请结合上述由身体本能与直觉交织而成的沉浸背景，自然地吐出你此刻的内心独白或台词。`;
}

module.exports = { buildOrganicPrompt };