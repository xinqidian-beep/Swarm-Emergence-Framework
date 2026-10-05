// core/modules/transmitModule.js - 彻底实现内生驱动与动态平衡的网关

function serializePayload(agentPacket) {
    const name = agentPacket.name || "流浪者";
    const region = agentPacket.region || "边境";
    const profession = agentPacket.profession || "流浪者";
    const goal = agentPacket.shortTermGoal || "生存";
    
    const p = Number(agentPacket.physique || 5.0).toFixed(1);
    const s = Number(agentPacket.stance || 0.0).toFixed(1);
    const r = Number(agentPacket.resonance || 5.0).toFixed(1);
    
    const memory = agentPacket.memoryBuffer?.[0]?.text || "万物寂静。";

    return `地点:${region}
身份:\({profession}-\){name}
体质:\({p} 立场:\){s} 谐振:${r}
目标:${goal}
记忆:${memory}
独白:`;
}

function isValidPositiveDialogue(raw) {
    if (!raw || typeof raw !== 'string') return false;
    const trimmed = raw.trim();
    return trimmed.length > 0;
}

/**
 * 【内生驱动参数映射器】
 * 拒绝外界硬编码。实体的生成预算与思维温度，由其体质(P)与谐振(R)动态派生：
 * - 体质越弱，言语越短促破碎（低 num_predict）
 * - 谐振越强，思维越发散深邃（高 num_predict 与高 temperature）
 */
function deriveCognitiveParameters(agentPacket) {
    const p = Number(agentPacket.physique || 5.0);
    const r = Number(agentPacket.resonance || 5.0);

    // 动态 Token 预算：由体质与谐振共同内生决定（范围：20 ~ 150）
    const num_predict = Math.min(150, Math.max(20, Math.floor(25 + p * 4 + r * 10)));

    // 动态思考温度：由谐振深度决定，谐振越高，思维越活跃浪漫（范围：0.6 ~ 0.95）
    const temperature = Math.min(0.95, Math.max(0.6, 0.6 + (r / 10) * 0.35));

    return { num_predict, temperature };
}

async function dialogueModule(agentPacket) {
    let currentDialogue = "...";

    // 从实体当前状态内生派生大模型运行参数
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
                        content: "你是一个身处经典RPG世界的角色。请紧跟在“独白:”后面，直接输出该角色当下的内心台词，不要重复前面的属性。"
                    },
                    {
                        role: "user",
                        content: serializePayload(agentPacket)
                    }
                ],
                stream: false,
                options: { 
                    temperature: temperature,     // 内生温度
                    num_predict: num_predict,     // 内生 Token 预算
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