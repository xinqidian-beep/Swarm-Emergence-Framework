// core/modules/transmitModule.js - 纯净的无状态投影网关（用后即弃）

function serializePayload(agentPacket) {
    const name = agentPacket.name || "流浪者";
    const region = agentPacket.region || "边境";
    const profession = agentPacket.profession || "流浪者";
    
    // 仅捕获当前 Tick 瞬间的量子刻度
    const p = Number(agentPacket.physique || 5.0).toFixed(1);
    const s = Number(agentPacket.stance || 0.0).toFixed(1);
    const r = Number(agentPacket.resonance || 5.0).toFixed(1);
    const ambient = Number(agentPacket.ambientEnergy || 0.5).toFixed(2);

    // 严禁塞入任何历史对话或记忆文本。采用纯正向陈述，让大模型每次都面对全新、纯粹的当下。彻底摒弃模板字符串，采用传统字符串拼接，防止任何网页端符号吞噬。
    return "当前所在地为" + region + "，我的身份是" + profession + "，名字叫" + name + "。" +
           "我当前的身体状态为体质" + p + "、立场" + s + "、谐振" + r + "、环境场压" + ambient + "。" +
           "我此刻唯一的自我意识流：";
}

function isValidPositiveDialogue(raw) {
    if (!raw || typeof raw !== 'string') return false;
    const trimmed = raw.trim();
    return trimmed.length > 0;
}

// 动态参数：完全由当前实体的物理/精神状态决定，不带任何历史记忆偏置
function deriveCognitiveParameters(agentPacket) {
    const p = Number(agentPacket.physique || 5.0);
    const r = Number(agentPacket.resonance || 5.0);

    const num_predict = Math.min(120, Math.max(25, Math.floor(30 + p * 3 + r * 8)));
    const temperature = Math.min(0.95, Math.max(0.65, 0.65 + (r / 10) * 0.3));

    return { num_predict, temperature };
}

async function dialogueModule(agentPacket) {
    let currentDialogue = "...";
    const { num_predict, temperature } = deriveCognitiveParameters(agentPacket);

    try {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "qwen2.5:0.5b",
                messages: [
                    {
                        role: "system",
                        // 【白名单规则】只界定允许发生的行为，绝不使用否定词
                        content: "你的唯一输出权限是：用第一人称‘我’写出一句完全面向自我的纯粹脑内思绪文本。"
                    },
                    {
                        role: "user",
                        content: serializePayload(agentPacket)
                    }
                ],
                stream: false,
                options: { 
                    temperature: temperature,
                    num_predict: num_predict,
                    repeat_penalty: 1.25, // 强力阻断词语重复
                    stop: ["\n", "地点:", "身份:"]
                }
            }),
            signal: AbortSignal.timeout(6000)
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.message && data.message.content) {
                let rawOutput = data.message.content.trim().replace(/["”’]/g, '');
                
                if (rawOutput.includes("独白:")) {
                    rawOutput = rawOutput.split("独白:").pop().trim();
                }

                if (isValidPositiveDialogue(rawOutput)) {
                    currentDialogue = rawOutput;
                }
            }
        }
    } catch (e) {
        currentDialogue = "...";
    }

    return {
        ...agentPacket,
        currentDialogue
    };
}

module.exports = { dialogueModule };