// core/modules/feedbackModule.js - 语义反哺动力学网关
function applySemanticFeedback(agentPacket) {
    let { physique: p, stance: s, resonance: r, currentDialogue } = agentPacket;

    if (!currentDialogue || currentDialogue === "..." || currentDialogue === "~") {
        return agentPacket;
    }

    const textLength = currentDialogue.length;
    
    // 1. 文本长度与内生谐振反哺：话语越深邃、字数越多，谐振度 R 获得正向滋养
    const rDelta = (textLength - 30) * 0.02; 
    r = Math.min(10.0, Math.max(1.0, r + rDelta));

    // 2. 关键词语义场强迫：如果台词中包含特定精神意象，直接扭曲底层物理场
    if (currentDialogue.includes("锤") || currentDialogue.includes("钢铁") || currentDialogue.includes("战斗")) {
        p = Math.min(10.0, p + 0.3); // 获得物理赋能
    }
    if (currentDialogue.includes("孤独") || currentDialogue.includes("月光") || currentDialogue.includes("河流")) {
        s = Math.max(-5.0, s - 0.2); // 立场向内收缩（趋向孤立/内省）
    } else if (currentDialogue.includes("守护") || currentDialogue.includes("战士") || currentDialogue.includes("人类")) {
        s = Math.min(5.0, s + 0.2);  // 立场向外扩张（趋向守护/外向）
    }

    // 随机微小热噪声，保持混沌系统的生命力
    p = Math.min(10.0, Math.max(1.0, p + (Math.random() * 0.2 - 0.1)));
    s = Math.min(5.0, Math.max(-5.0, s + (Math.random() * 0.2 - 0.1)));

    return {
        ...agentPacket,
        physique: Number(p.toFixed(2)),
        stance: Number(s.toFixed(2)),
        resonance: Number(r.toFixed(2))
    };
}

module.exports = { applySemanticFeedback };