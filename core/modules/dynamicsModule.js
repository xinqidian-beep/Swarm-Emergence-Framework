// core/modules/dynamicsModule.js - 【SEALED IMMUTABLE DYNAMICS CORE】
// 声明：此乃宇宙底层物理法则。法则一经封存，永不修改。
// 它只接受状态（State）的输入与演化，绝不接受任何运行规则（Rule）的动态更改。

function dynamicsModule(agentPacket) {
    // 1. 【State Ingestion】纯粹的状态采样解构
    const { 
        physique = 0.0, 
        stance = 0.0, 
        resonance = 0.0, 
        intrinsicFactor = 0.0, 
        memoryBuffer = [], 
        currentDialogue = "",
        ambientEnergy = 0.5, 
        ...rest 
    } = agentPacket;

    const MAX_LIMIT = 5.0; // 宇宙对称边界 [-5.0, +5.0]

    // 2. 【Immutable Physical Laws】不可篡改的物理场演化定律
    // 非线性阻尼场（边界自适应减速）
    const pDamping = 1 - Math.pow(physique / MAX_LIMIT, 2);
    const sDamping = 1 - Math.pow(stance / MAX_LIMIT, 2);
    const rDamping = 1 - Math.pow(resonance / MAX_LIMIT, 2);

    // 永不停息的微观热噪声与环境场压耦合
    const rawP = (Math.random() - 0.5) * 1.2 * Math.max(0.1, pDamping);
    const rawS = (Math.random() - 0.5) * 0.8 * Math.max(0.1, sDamping) + (ambientEnergy - 0.5) * 0.15;
    const rawR = (Math.random() - 0.5) * 1.0 * Math.max(0.1, rDamping) + intrinsicFactor + ambientEnergy * 0.1;

    // 0 中心双向演化：含弹性恢复力与维度交叉耦合
    const newPhysique = Math.max(-MAX_LIMIT, Math.min(MAX_LIMIT, physique + rawP + resonance * 0.04 - physique * 0.06));
    const newStance = Math.max(-MAX_LIMIT, Math.min(MAX_LIMIT, stance + rawS + physique * 0.02 - stance * 0.06));
    const newResonance = Math.max(-MAX_LIMIT, Math.min(MAX_LIMIT, resonance + rawR - Math.abs(stance) * 0.06 - resonance * 0.06));

    // 3. 【Thermodynamic Memory Law】热力学内生记忆演化（无任何命令式截断）
    const currentSalience = Math.abs(newStance) * ((Math.abs(newResonance) + 1) / (MAX_LIMIT + 1)) + Math.abs(newPhysique) * 0.2;
    
    const memoryEntry = {
        text: currentDialogue,
        weight: currentSalience
    };

    // 动态内生认知带宽阈值（由共鸣与环境压强自主决定记忆生死）
    const cognitiveBandwidthThreshold = 0.25 * (1 - Math.abs(newResonance) / MAX_LIMIT) + (1 - ambientEnergy) * 0.15;

    const evolvedMemories = [...memoryBuffer, memoryEntry]
        .map(item => ({
            text: item.text,
            weight: item.weight * (0.88 + (Math.random() - 0.5) * 0.1) // 伴随热涨落的自然衰减
        }))
        .filter(item => item.weight >= cognitiveBandwidthThreshold); // 自主突现与遗忘

    // 4. 【Homomorphic Passthrough】同构打包透传（将演化后的状态与不需要的宏观属性完美交割）
    return {
        ...rest,
        physique: Number(newPhysique.toFixed(2)),
        stance: Number(newStance.toFixed(2)),
        resonance: Number(newResonance.toFixed(2)),
        intrinsicFactor,
        memoryBuffer: evolvedMemories
    };
}

module.exports = { dynamicsModule };