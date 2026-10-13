// core/dynamics/dynamicsModule.js - 严格对齐动态阈值与驱动力契约的自治核心

function finiteNumber(v, fallback = 0) {
    return (typeof v === 'number' && Number.isFinite(v)) ? v : fallback;
}

/**
 * 动态内生阈值生成规律（由环境压强与当前局部状态耦合决定的动态门槛）
 * 法则本身是封闭固定的，但阈值随环境与状态动态浮动。
 */
function computeDynamicThreshold(ambientEnergy, P, S, R) {
    const baseThreshold = 1.6;
    // 环境压强越高，或者当前身心状态波动越大，表达所需的张力门槛也随之微妙起伏
    return baseThreshold + 0.3 * finiteNumber(ambientEnergy, 0.2) + 0.05 * Math.sin(P + S + R);
}

/**
 * 推进单个 Tick 的相空间演化
 * @param {Object} agent - 实体当前完整状态
 * @param {Array} deltaQueue - 该实体专属的反馈摄动队列（契约：作为微分驱动力输入，经 dt 与耗散处理）
 * @param {Number} ambientEnergy - 环境压强（纯元数据透传）
 */
function stepDynamics(agent, deltaQueue = [], ambientEnergy = 0.2) {
    // 1. 内部状态保留完整高精度浮点数
    let P = finiteNumber(agent.physique, 0);
    let S = finiteNumber(agent.stance, 0);
    let R = finiteNumber(agent.resonance, 0);

    // 2. 消费该实体专属的反馈摄动 Δ（安全防护：防范空对象或断裂条目）
    let deltaP = 0, deltaS = 0, deltaR = 0;
    while (deltaQueue && deltaQueue.length > 0) {
        const d = deltaQueue.shift();
        deltaP += finiteNumber(d?.dP, 0);
        deltaS += finiteNumber(d?.dS, 0);
        deltaR += finiteNumber(d?.dR, 0);
    }

    // 3. 引入微小的内生背景微扰（防止陷入绝对零度热寂，向内不死）
    const microNoise = () => (Math.random() - 0.5) * 0.002;
    deltaP += microNoise();
    deltaS += microNoise();
    deltaR += microNoise();

    // 4. 离散步进参数
    const dt = 0.2;
    const linearDamping = 0.15;
    const restoringCoefficient = 0.008;

    // 5. 半隐式稳定更新（防爆散：恢复力与阻尼按隐式分母处理）
    const denomP = 1.0 + (linearDamping + restoringCoefficient * P * P) * dt;
    const denomS = 1.0 + (linearDamping + restoringCoefficient * S * S) * dt;
    const denomR = 1.0 + (linearDamping + restoringCoefficient * R * R) * dt;

    let newP = (P + (Math.sin(S) + deltaP) * dt) / denomP;
    let newS = (S + (Math.sin(R) + deltaS) * dt) / denomS;
    let newR = (R + (Math.sin(P) + deltaR) * dt) / denomR;

    // 6. 使用 Math.hypot 计算高精度张力
    const tension = Math.hypot(newP, newS, newR);

    // 7. 动态内生门控：通过动态阈值生成规律判定表达资格
    const threshold = computeDynamicThreshold(ambientEnergy, newP, newS, newR);
    const wantsToExpress = tension > threshold;

    // 8. 返回完整精度的计算结果（写回权归核心所有，ambientEnergy 纯元数据透传）
    return {
        ...agent,
        physique: newP,
        stance: newS,
        resonance: newR,
        tension: Number(tension.toFixed(2)),
        wantsToExpress,
        ambientEnergy: finiteNumber(ambientEnergy, 0.2)
    };
}

// 全方位兼容契约绑定
stepDynamics.stepDynamics = stepDynamics;
stepDynamics.dynamicsModule = stepDynamics;
stepDynamics.default = stepDynamics;

module.exports = stepDynamics;