const fs = require("fs");
let gemini = fs.readFileSync("apps/worker/src/providers/gemini.ts", "utf-8");

const patch = `  if (typeStr === 'boolean') return { type: Type.BOOLEAN, description: schema.description };
  if (typeStr === 'enum' || schema._def?.typeName === 'ZodEnum') {
    const values = schema.def?.entries ? Object.keys(schema.def.entries) : schema._def?.values;
    return {
      type: Type.STRING,
      enum: values,
      description: schema.description
    };
  }
`;

gemini = gemini.replace(
  /  if \(typeStr === 'boolean'\) return \{ type: Type\.BOOLEAN, description: schema\.description \};/g,
  patch
);

fs.writeFileSync("apps/worker/src/providers/gemini.ts", gemini, "utf-8");
