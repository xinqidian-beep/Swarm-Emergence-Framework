// core/modules/transmitModule.js

async function dialogueModule(agentPacket) {
    const { 
        name = "未知实体", 
        profession = "流民", 
        region = "荒野", 
        sensoryPrompt = "", // 上游产出的 statePrompt
        ...rest 
    } = agentPacket;

    let spokenText = "";

    if (!sensoryPrompt || sensoryPrompt.trim() === "") {
        return { ...rest, currentDialogue: "" };
    }

    // 系统契约：极简
    const systemContract = `你正在角色扮演天际省的${profession} ${name}。
必须严格遵循：
1. 只说简短的第一人称台词。
2. 严禁第三方旁白、动作描写、AI说明或复读输入。
3. 严禁复读输入。`;

    const userState = sensoryPrompt;

    try {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "qwen2.5:0.5b",
                messages: [
                    { role: "system", content: systemContract },
                    { role: "user", content: userState }
                ],
                stream: false,
                options: { 
                    temperature: 0.1, // 极低温度压制旁白与复读
                    num_predict: 24,   // 强行限制吐字长度，切断长小说生成
                    stop: ["当前身心状态", "莉迪亚", "哈瓦尔", "米拉", "\n"] // 碰到名字或换行立刻停止！
                }
            }),
            signal: AbortSignal.timeout(12000)
        });

        if (response.ok) {
            const data = await response.json();
            const content = String(data?.message?.content || "").trim();
            // 剥离可能的杂质
            const clean = content
                .replace(/<think>[\s\S]*?<\/think>/g, "")
                .replace(/^当前身心状态[:：]?/g, "")
                .split('\n')[0]
                .replace(/^["「]|["」]$/g, '')
                .trim();
                
            if (clean) spokenText = clean;
        }
    } catch (error) {
        spokenText = "";
    }

    return {
        ...rest,
        sensoryPrompt,
        currentDialogue: spokenText
    };
}

module.exports = dialogueModule;
module.exports.dialogueModule = dialogueModule;