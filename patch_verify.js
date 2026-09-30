const fs = require("fs");
let verify = fs.readFileSync("apps/worker/src/stages/verify/index.ts", "utf-8");

// Change provider and model
verify = verify.replace(/provider: "gemini",\s*model: "gemini-3\.6-flash"/g, 'provider: "zai",\n    model: "glm-4-flash"');

// Fix app_settings fetch logic
verify = verify.replace(/const \{ data: appSettings \} = await ctx\.supabase\.from\("app_settings"\)\.select\("key, value"\)\.in\("key", \["auto_publish_enabled", "auto_publish_min_confidence"\]\);[\s\S]*?console\.log\(`Auto Publish Settings: Enabled=\$\{autoPublishEnabled\}, MinConf=\$\{autoPublishMinConf\}`\);/m, 
`const { data: appSettings } = await ctx.supabase.from("app_settings").select("key, value").eq("key", "moderation").single();
  
  let autoPublishEnabled = false;
  let autoPublishMinConf = 80; // percent
  
  if (appSettings && appSettings.value) {
    autoPublishEnabled = !!appSettings.value.autoPublish;
    autoPublishMinConf = appSettings.value.confidenceThreshold || 80;
  }

  // convert 80 to 0.8
  const minConfDecimal = autoPublishMinConf / 100;

  console.log(\`Auto Publish Settings: Enabled=\${autoPublishEnabled}, MinConf=\${minConfDecimal}\`);`);

// Fix the confidence check variable name
verify = verify.replace(/autoPublishMinConf/g, "minConfDecimal");

fs.writeFileSync("apps/worker/src/stages/verify/index.ts", verify, "utf-8");
