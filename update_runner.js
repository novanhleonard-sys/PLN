const fs = require('fs');
const path = require('path');

const filePath = path.join('D:\\project\\PETA LN\\apps\\worker\\src\\core\\runner.ts');
let content = fs.readFileSync(filePath, 'utf8');

const searchStr =         if (msg.includes('BUDGET_EXCEEDED')) {
          await this.markDeferred(job.id, msg);
        } else if (msg.includes('429') || msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('500') || msg.includes('503')) {
          await this.handleRateLimit(job, msg);
        } else {
          await this.handleRetry(job, msg);
        };

const replaceStr =         if (msg.includes('BUDGET_EXCEEDED')) {
          await this.markDeferred(job.id, msg);
        } else if (msg.includes('402') || msg.toLowerCase().includes('prepayment credits are depleted') || msg.toLowerCase().includes('out of credits')) {
          await this.handleRetry(job, msg, true);
        } else if (msg.includes('429') || msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('500') || msg.includes('503')) {
          await this.handleRateLimit(job, msg);
        } else {
          await this.handleRetry(job, msg);
        };

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(filePath, content);
console.log('Modified runner.ts');
