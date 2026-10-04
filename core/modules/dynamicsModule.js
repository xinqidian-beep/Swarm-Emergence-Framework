// core/modules/dynamicsModule.js - 融入局域环境场耦合的动力单元

function dynamicsModule(agentPacket) {
    // 1. 【Sample 采样】提取自身物理量与环境压强
    const { 
        physique, 
        stance, 
        resonance, 
        intrinsicFactor = 0.0, 
        memoryBuffer = [], 
        currentDialogue = "",
        shortTermGoal = "维持现状",
        ambientEnergy = 0.5, // 局域环境共鸣压强
        ...rest 
    } = agentPacket;

    // 2. 【Dynamics 动力】引入环境能量场的非线性耦合（无 if）
    const pDamping = 1 - Math.pow((physique - 5) / 5, 2);
    const sDamping = 1 - Math.pow(stance / 5, 2);
    const rDamping = 1 - Math.pow((resonance - 5) / 5, 2);

    // 环境能量场作为外部微扰，直接注入谐振与立场的变化率中
    const rawP = (Math.random() - 0.5) * 1.2 * Math.max(0.1, pDamping);
    const rawS = (Math.random() - 0.5) * 0.8 * Math.max(0.1, sDamping) + (ambientEnergy - 0.5) * 0.15;
    const rawR = (Math.random() - 0.5) * 1.0 * Math.max(0.1, rDamping) + intrinsicFactor + ambientEnergy * 0.1;

    const newPhysique = Math.max(0.5, Math.min(10, physique + rawP + (resonance - 5) * 0.04));
    const newStance = Math.max(-5, Math.min(5, stance + rawS + (physique - 5) * 0.02 - stance * 0.05));
    const newResonance = Math.max(0.5, Math.min(10, resonance + rawR - Math.abs(stance) * 0.06));

    // 3. 【Memory & Goal Dynamics 显著性权重与目标自适应漂移】
    const currentSalience = Math.abs(newStance) * (newResonance / 5.0) + Math.abs(newPhysique - 5.0) * 0.2;
    
    const memoryEntry = {
        text: currentDialogue,
        weight: currentSalience
    };

    const decayedMemories = memoryBuffer.map(item => ({
        text: item.text,
        weight: item.weight * 0.92
    }));

    const combinedMemories = [...decayedMemories, memoryEntry];
    const sortedMemories = combinedMemories.sort((a, b) => b.weight - a.weight);
    const updatedMemory = sortedMemories.slice(0, 3);

    const valenceSum = newStance + (newResonance - 5) * 0.1;
    const goalSpectrum = ["寻求休整", "观察周遭", "暗中警惕", "顺势而行"];
    const goalIndex = Math.abs(Math.floor((valenceSum + 5) * 0.4)) % goalSpectrum.length;
    const newGoal = goalSpectrum[goalIndex];

    // 4. 【Transmit 传递】
    return {
        ...rest,
        physique: newPhysique,
        stance: newStance,
        resonance: newResonance,
        intrinsicFactor,
        memoryBuffer: updatedMemory,
        shortTermGoal: newGoal
    };
}

module.exports = { dynamicsModule };