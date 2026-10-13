// core/modules/transmitModule.js - 局域白名单约束的 Qwen 角色具现算子

async function dialogueModule(agentPacket) {
    const { 
        name = "未知实体", 
        profession = "流民", 
        region = "荒野", 
        archetype = "中立者",
        shortTermGoal = "维持生存",
        sensoryPrompt = "",
        ...rest 
    } = agentPacket;

    let spokenText = "";

    // 若无中观感官提示词，短路返回
    if (!sensoryPrompt || sensoryPrompt.trim() === "") {
        return {
            ...rest,
            currentDialogue: ""
        };
    }

    // 剥离身份后的下游 Prompt 应当只有转译结果本身
const actorPrompt = `${sensoryPrompt}

要求：根据提示词进行开放世界游戏天际5的角色扮演，以第一人称表达自言自语或是与他人交谈，禁止第三人称旁白。`;

    try {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "qwen2.5:0.5b",
                messages: [{ role: "user", content: actorPrompt }],
                stream: false,
                options: { temperature: 0.3, num_predict: 48 }
            }),
            signal: AbortSignal.timeout(12000)
        });

        if (response.ok) {
            const data = await response.json();
            const content = String(data?.message?.content || "").trim();
            const clean = content.replace(/<think>[\s\S]*?<\/think>/g, "").split('\n')[0].replace(/^["「]|["」]$/g, '').trim();
            if (clean) spokenText = clean;
        }
    } catch (error) {
        spokenText = "";
    }

    return {
        ...rest,
        name, profession, region, archetype, shortTermGoal, sensoryPrompt,
        currentDialogue: spokenText
    };
}

module.exports = dialogueModule;
module.exports.dialogueModule = dialogueModule;