const fs = require("fs");
let c = fs.readFileSync("apps/worker/src/providers/registry.ts", "utf-8");

c = c.replace(
  /private async logUsage\([\s\S]*?\n  \}/g,
  `private async logUsage(opts: GenerateOptions, inputTokens: number, outputTokens: number, isImage: boolean, status: string, attempt: number, errorMsg: string | null = null, costUsdOverride?: number) {
    const cost = costUsdOverride !== undefined ? costUsdOverride : calculateCost(opts.provider, opts.model, inputTokens, outputTokens, isImage);
    try {
      await this.supabase.from('ai_usage').insert({
        stage: opts.stage,
        provider: opts.provider,
        model: opts.model,
        units_in: inputTokens,
        units_out: outputTokens,
        cost_usd: cost,
        ref: opts.ref,
        user_id: opts.userId,
        operation_status: status,
        attempt: attempt,
        error_message: errorMsg
      });
    } catch (e) {
      console.error("Failed to log usage:", e);
    }
  }`
);

c = c.replace(
  /let attempt = 0;\s*while \(attempt < 2\) \{ \/\/ 1 retry\s*try \{\s*const result = await provider\.generateJSON\(opts\.model, opts\.prompt, schema, opts\.systemInstruction, opts\);\s*await this\.logUsage\(opts, result\.inputTokens, result\.outputTokens, false\);\s*return result\.data;\s*\} catch \(err: any\) \{\s*attempt\+\+;\s*if \(attempt >= 2\) \{\s*throw new Error\('Provider ' \+ opts\.provider \+ ' failed after retry: ' \+ err\.message, \{ cause: err \}\);\s*\}\s*\}\s*\}/g,
  `let attempt = 0;
    while (attempt < 2) {
      try {
        const result = await provider.generateJSON(opts.model, opts.prompt, schema, opts.systemInstruction, opts);
        await this.logUsage(opts, result.inputTokens, result.outputTokens, false, 'succeeded', attempt + 1);
        return result.data;
      } catch (err: any) {
        await this.logUsage(opts, 0, 0, false, 'failed', attempt + 1, err.message);
        attempt++;
        if (attempt >= 2) throw new Error('Provider ' + opts.provider + ' failed after retry: ' + err.message, { cause: err });
      }
    }`
);

c = c.replace(
  /let attempt = 0;\s*while \(attempt < 2\) \{ \/\/ 1 retry\s*try \{\s*const result = await provider\.generateText\(opts\.model, opts\.prompt, opts\.systemInstruction, opts\);\s*await this\.logUsage\(opts, result\.inputTokens, result\.outputTokens, false\);\s*return result\.text;\s*\} catch \(err: any\) \{\s*attempt\+\+;\s*if \(attempt >= 2\) \{\s*throw new Error\('Provider ' \+ opts\.provider \+ ' failed after retry: ' \+ err\.message, \{ cause: err \}\);\s*\}\s*\}\s*\}/g,
  `let attempt = 0;
    while (attempt < 2) {
      try {
        const result = await provider.generateText(opts.model, opts.prompt, opts.systemInstruction, opts);
        await this.logUsage(opts, result.inputTokens, result.outputTokens, false, 'succeeded', attempt + 1);
        return result.text;
      } catch (err: any) {
        await this.logUsage(opts, 0, 0, false, 'failed', attempt + 1, err.message);
        attempt++;
        if (attempt >= 2) throw new Error('Provider ' + opts.provider + ' failed after retry: ' + err.message, { cause: err });
      }
    }`
);

c = c.replace(
  /let attempt = 0;\s*while \(attempt < 2\) \{\s*try \{\s*const result = await provider\.generateAudio\(opts\.model, opts\.prompt, opts\.voiceName, opts\.systemInstruction, opts\);\s*await this\.logUsage\(opts, result\.inputTokens, result\.outputTokens, false\);\s*return result\.audioBase64;\s*\} catch \(err: any\) \{\s*attempt\+\+;\s*if \(attempt >= 2\) \{\s*throw new Error\('Provider ' \+ opts\.provider \+ ' failed audio generation after retry: ' \+ err\.message, \{ cause: err \}\);\s*\}\s*\}\s*\}/g,
  `let attempt = 0;
    while (attempt < 2) {
      try {
        const result = await provider.generateAudio(opts.model, opts.prompt, opts.voiceName, opts.systemInstruction, opts);
        await this.logUsage(opts, result.inputTokens, result.outputTokens, false, 'succeeded', attempt + 1);
        return result.audioBase64;
      } catch (err: any) {
        await this.logUsage(opts, 0, 0, false, 'failed', attempt + 1, err.message);
        attempt++;
        if (attempt >= 2) throw new Error('Provider ' + opts.provider + ' failed audio generation after retry: ' + err.message, { cause: err });
      }
    }`
);

c = c.replace(
  /let attempt = 0;\s*while \(attempt < 2\) \{\s*try \{\s*const result = await provider\.generateImage\(opts\.model, opts\.prompt, opts\.referenceImages, opts\);\s*let cost = result\.costUsd \|\| 0;\s*if \(!result\.costUsd\) \{\s*\/\/ For Imagen 3, the cost is roughly \$0\.03 per image\s*cost = calculateCost\(opts\.provider, opts\.model, 0, 1, true\);\s*\}\s*await this\.supabase\.from\('ai_usage'\)\.insert\(\{\s*stage: opts\.stage,\s*provider: opts\.provider,\s*model: opts\.model,\s*units_in: 0,\s*units_out: 1, \/\/ 1 image\s*cost_usd: cost,\s*ref: opts\.ref,\s*user_id: opts\.userId\s*\}\);\s*return result\.imageBase64;\s*\} catch \(err: any\) \{\s*attempt\+\+;\s*if \(attempt >= 2\) \{\s*throw new Error\('Provider ' \+ opts\.provider \+ ' failed image generation after retry: ' \+ err\.message, \{ cause: err \}\);\s*\}\s*\}\s*\}/g,
  `let attempt = 0;
    while (attempt < 2) {
      try {
        const result = await provider.generateImage(opts.model, opts.prompt, opts.referenceImages, opts);
        let cost = result.costUsd || calculateCost(opts.provider, opts.model, 0, 1, true);
        await this.logUsage(opts, 0, 1, true, 'succeeded', attempt + 1, null, cost);
        return result.imageBase64;
      } catch (err: any) {
        await this.logUsage(opts, 0, 0, true, 'failed', attempt + 1, err.message);
        attempt++;
        if (attempt >= 2) throw new Error('Provider ' + opts.provider + ' failed image generation after retry: ' + err.message, { cause: err });
      }
    }`
);

fs.writeFileSync("apps/worker/src/providers/registry.ts", c, "utf-8");
