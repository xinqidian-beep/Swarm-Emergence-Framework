// core/modules/memory.js - 长短期记忆预留桩
function processMemory(agent) {
    const { currentDialogue, history = [], ...rest } = agent;
    
    // 维持一个容量为 5 的简易短期记忆队列（用后即弃，轻量化滚动）
    const updatedHistory = [...history, currentDialogue].slice(-5);

    return {
        currentDialogue,
        history: updatedHistory,
        ...rest
    };
}

module.exports = { processMemory };