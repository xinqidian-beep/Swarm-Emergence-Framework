// core/modules/transmitModule.js - 语言中枢（Qwen 具现化与同构透传版）
async function dialogueModule(agentPacket) {
    // 1. 解构必要字段，并通过 ...rest 完美捕获并保留上游所有的物理场与记忆残片
    const { 
        name = "未知实体", 
        profession = "流民", 
        region = "荒野", 
        organicContext = "", 
        ...rest 
    } = agentPacket;

    let spokenText = "...";

    // 若无有效的织网上下文，直接短路返回，并通过 ...rest 完整透传
    if (!organicContext || organicContext.trim() === "") {
        return {
            ...rest,
            name,
            profession,
            region,
            organicContext,
            dialogue: "..."
        };
    }

    try {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "qwen2.5:0.5b", // 主力 Qwen 语言模型
                messages: [
                    {
                        role: "system",
                        content: `你正在展现${region}的${profession}${name}的内心独白与即时言语。`
                    },
                    {
                        role: "user",
                        content: organicContext
                    }
                ],
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 128
                }
            }),
            signal: AbortSignal.timeout(20000)
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.message && data.message.content) {
                let raw = data.message.content.trim();
                raw = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                if (raw.length > 0) {
                    spokenText = raw.replace(/^["「]|["」]$/g, '');
                }
            }
        }
    } catch (error) {
        console.error(`[Transmit 链路异常] 角色 ${name} 语言具现失败:`, error.message);
        spokenText = "...";
    }

    // 2. 严格遵循同构透传：用 ...rest 将物理张力、记忆缓冲区等底层资产毫无损耗地带给下一阶段
    return {
        ...rest,
        name,
        profession,
        region,
        organicContext,
        dialogue: spokenText,
        currentDialogue: spokenText // 兼容主控台映射
    };
}

module.exports = { dialogueModule };