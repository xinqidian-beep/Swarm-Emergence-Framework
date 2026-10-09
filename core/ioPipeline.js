// core/ioPipeline.js - 绝对中立的同构 I/O 流水线调度总线

class IOPipeline {
    constructor() {
        this.middlewareStages = [];
    }

    /**
     * 注册一个局域演化模块（过滤器）
     * @param {Function} moduleFn - 纯函数模块，接收 packet 并返回更新后的字段或新 packet
     */
    use(moduleFn) {
        this.middlewareStages.push(moduleFn);
        return this;
    }

    /**
     * 驱动同构信息包流经整条流水线
     * 保证：各模块按需取用，未使用的字段通过 ...rest 零丢失同构透传
     * @param {Object} initialAgentPacket - 初始同构信息包
     * @returns {Promise<Object>} 演化完成后的最终同构包
     */
    async executeTick(initialAgentPacket) {
        let currentPacket = { ...initialAgentPacket }; // 浅拷贝建立初始同构隔离

        for (const stage of this.middlewareStages) {
            try {
                // 模块执行：各模块只对返回的新状态负责，其余未涉及字段必须在模块内部通过 ...rest 保证不丢失
                const stageResult = await stage(currentPacket);
                
                if (stageResult && typeof stageResult === 'object') {
                    // 同构合并：确保任何底层未显式处理的属性都不会在流水线中被吞没
                    currentPacket = {
                        ...currentPacket,
                        ...stageResult
                    };
                }
            } catch (error) {
                console.error(`[I/O 管道异常] 模块在交割时发生阻断:`, error.message);
                // 发生局部异常时，保持当前同构包原样透传，确保系统“不死不崩”
            }
        }

        return currentPacket;
    }
}

module.exports = { IOPipeline };