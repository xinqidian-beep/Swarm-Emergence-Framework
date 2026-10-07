// core/modules/transmitModule.js - 语言中枢（由 Qwen 主力模型驱动，遵循纯结构驱动）

async function dialogueModule(agentPacket) {
    const { name, profession, region, organicContext } = agentPacket;

    let spokenText = "...";

    try {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "qwen2.5:0.5b", // 主力 Qwen 语言模型
                messages: [
                    {
                        role: "system",
                        // 摒弃负向约束指令，仅通过纯粹的角色 ontological 设定维持边界
                        content: `你正在展现${region}的${profession}${name}的内心独白。`
                    },
                    {
                        role: "user",
                        // organicContext 已经完成了所有的有机织网，这里直接作为唯一的上下文承接
                        content: organicContext
                    }
                ],
                stream: false,
                options: {
                    temperature: 0.8,
                    num_predict: 80
                }
            }),
            signal: AbortSignal.timeout(6000)
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.message && data.message.content) {
                let raw = data.message.content.trim();
                // 仅做最基础的清洗，不依赖大模型去强行遵守负向指令
                raw = raw.replace(/^["“]|["”]$/g, '').trim();
                if (raw.length > 0) {
                    spokenText = raw;
                }
            }
        }
    } catch (e) {
        spokenText = "...";
    }

    return {
        ...agentPacket,
        dialogue: spokenText
    };
}

module.exports = { dialogueModule };