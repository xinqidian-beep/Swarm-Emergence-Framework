// core/modules/dynamics.js - 局域内生互锁动力学演化
function processDynamics(agent) {
    // 仅解构并使用自己需要的维度，其余属性通过 ...rest 原封不动保留
    const { physique, stance, resonance, ...rest } = agent;

    // 1. 非线性阻力（绝对值越大，阻力越大，趋近边界时自动减速）
    const pDamping = 1 - Math.pow((physique - 5) / 5, 2);
    const sDamping = 1 - Math.pow(stance / 5, 2);
    const rDamping = 1 - Math.pow((resonance - 5) / 5, 2);

    const rawP = (Math.random() - 0.5) * 1.2 * Math.max(0.1, pDamping);
    const rawS = (Math.random() - 0.5) * 0.8 * Math.max(0.1, sDamping);
    const rawR = (Math.random() - 0.5) * 1.0 * Math.max(0.1, rDamping);

    // 2. 三项值内生互锁耦合
    const newPhysique = Math.max(0.5, Math.min(10, physique + rawP + (resonance - 5) * 0.04));
    const newStance = Math.max(-5, Math.min(5, stance + rawS + (physique - 5) * 0.02 - stance * 0.05));
    const newResonance = Math.max(0.5, Math.min(10, resonance + rawR - Math.abs(stance) * 0.06));

    // 3. 同构打包：更新后的状态与未使用的其余信息共同向下传递
    return {
        ...rest,
        physique: newPhysique,
        stance: newStance,
        resonance: newResonance
    };
}

module.exports = { processDynamics };