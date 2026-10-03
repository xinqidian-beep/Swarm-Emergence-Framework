// core/modules/dynamicsModule.js - 纯数据驱动、完全无 if 分支的动力学分形单元

function dynamicsModule(agentPacket) {
    // 1. 【Sample 采样】白名单提取：统一获取物理量与内在数值因子
    const { physique, stance, resonance, intrinsicFactor = 0.0, ...rest } = agentPacket;

    // 2. 【Dynamics 动力】统一的非线性阻力与三维互锁（零 if 分支）
    const pDamping = 1 - Math.pow((physique - 5) / 5, 2);
    const sDamping = 1 - Math.pow(stance / 5, 2);
    const rDamping = 1 - Math.pow((resonance - 5) / 5, 2);

    const rawP = (Math.random() - 0.5) * 1.2 * Math.max(0.1, pDamping);
    const rawS = (Math.random() - 0.5) * 0.8 * Math.max(0.1, sDamping);
    
    // 内在因子作为连续变量直接参与数学映射，而不是通过 if 判断区分
    const rawR = (Math.random() - 0.5) * 1.0 * Math.max(0.1, rDamping) + intrinsicFactor;

    const newPhysique = Math.max(0.5, Math.min(10, physique + rawP + (resonance - 5) * 0.04));
    const newStance = Math.max(-5, Math.min(5, stance + rawS + (physique - 5) * 0.02 - stance * 0.05));
    const newResonance = Math.max(0.5, Math.min(10, resonance + rawR - Math.abs(stance) * 0.06));

    // 4. 【Transmit 传递】同构打包：原封不动向后流转所有原生数据
    return {
        intrinsicFactor,
        physique: newPhysique,
        stance: newStance,
        resonance: newResonance,
        ...rest
    };
}

module.exports = { dynamicsModule };