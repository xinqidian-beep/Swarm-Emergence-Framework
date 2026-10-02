// core/slotMatcher.js - 本地轻量规则与槽位文本匹配引擎

// 预设的本地语料库（按立场区间分类）
const dialoguePool = {
    hostile: [ // 负向立场 (stance < -0.3)
        "这日子没法过了，到处都是危机...",
        "别靠近我，我信不过这里的任何人。",
        "资源越来越少，迟早要出大事。",
        "哼，那些家伙根本不知道他们在干什么。"
    ],
    neutral: [ // 中间立场 (-0.3 <= stance <= 0.3)
        "今天天气倒是不错，就是有点冷。",
        "你看到前边那群人了吗？神神秘秘的。",
        "我得去把手头这点活儿干完。",
        "日子就这么一天天过呗，还能怎样。"
    ],
    friendly: [ // 正向立场 (stance > 0.3)
        "哈哈，跟着大家一起干，生活总算有盼头了！",
        "我觉得情况在变好，大家要团结.",
        "如果你需要帮忙，随时来找我！",
        "这地方越来越有生气了，不是吗？"
    ]
};

function generateDialogue(agent) {
    let category = 'neutral';
    if (agent.stance < -0.3) {
        category = 'hostile';
    } else if (agent.stance > 0.3) {
        category = 'friendly';
    }

    const pool = dialoguePool[category];
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
}

module.exports = { generateDialogue };