// core/modules/deepseekTranslator.js - 神经转译器（由 DeepSeek 1.5B 驱动）

async function translateStateWithDeepSeek(agentPacket) {
    const { name, profession, region, physique, stance, resonance, ambientEnergy } = agentPacket;

    const translationPrompt = `你是一个人类生物体的潜意识直觉生成器。根据以下状态参数，用第一人称写一段极其自然的肉体感觉和心理氛围描述（控制在40字以内）。绝对不要出现任何数字、坐标或属性名称。
身份：\({region}的\){profession} ${name}
体质数值(P)：${Number(physique).toFixed(1)}（数值高代表精力充沛，低代表疲惫虚弱）
立场数值(S)：${Number(stance).toFixed(1)}（数值高代表外向守护，低代表孤立戒备）
谐振数值(R)：${Number(resonance).toFixed(1)}（数值高代表感知敏锐、思维飘逸）
环境场压：${Number(ambientEnergy).toFixed(2)}`;

    let phenomenologicalText = "身体感觉平稳，思绪如常。";

    try {
        // 直接使用 Node.js 24 自带的全局 fetch
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "deepseek-r1:1.5b", // 确保你在 Ollama 中已经 pull 了该模型，或者改成你本地有的模型名
                messages: [
                    {
                        role: "system",
                        content: "你是一个纯粹的文学感官转译器。只输出一段短小的第一人称心理或生理直觉，绝对禁止输出任何解释、代码、标点以外的格式或数字。"
                    },
                    {
                        role: "user",
                        content: translationPrompt
                    }
                ],
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 60
                }
            }),
            signal: AbortSignal.timeout(4000)
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.message && data.message.content) {
                let raw = data.message.content.trim();
                // 清洗可能存在的 R1 思考标签
                raw = raw.replace(/[\s\S]*?<\/think>/g, '').trim();
                if (raw.length > 0) {
                    phenomenologicalText = raw;
                }
            }
        }
    } catch (e) {
        // 容错降级，确保心跳绝对不崩溃
        phenomenologicalText = "四周一片寂静，心跳平缓有力。";
    }

    return phenomenologicalText;
}

module.exports = { translateStateWithDeepSeek };