// core/modules/organicNarrative.js - 叙事织网器（强化反复读与第一人称契约版）

function buildOrganicPrompt(agentPacket) {
    const { name, profession, region, phenomenon } = agentPacket;

    return `[当前所在区域: ${region}]
- 角色身份: ${profession} ${name}

[身体直觉与环境潜流]
${phenomenon || "周遭一片寂静，空气中弥漫着未知的气息。"}

【严格指令】
1. 以第一人称（我）的视角，将上述身体直觉与环境潜流内化为你的真实感受，自然地吐出你此刻的一句内心独白或台词。
2. 绝对严禁照抄、复述或机械拼接上面的状态文本！必须将其转化为符合你身份的口语化表达。
3. 只输出最终的台词或独白文本，不输出任何引号、前缀、署名、动作描写或解释。`;
}

module.exports = { buildOrganicPrompt };