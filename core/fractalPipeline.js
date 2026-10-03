// core/fractalPipeline.js - 宏观分形管道编排器
const { dynamicsModule } = require('./modules/dynamicsModule');
const { dialogueModule } = require('./modules/dialogueModule');

async function runFractalPipeline(agent) {
    let packet = agent;
    
    // 细胞级分形流转：每一个模块都是独立的采样、动力、计算、传递闭环
    packet = dynamicsModule(packet);         // 单元 1：动力学分形
    packet = await dialogueModule(packet);   // 单元 2：对话计算分形

    return packet;
}

module.exports = { runFractalPipeline };