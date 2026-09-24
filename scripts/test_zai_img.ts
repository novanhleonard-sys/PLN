import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const apiKey = process.env.ZAI_API_KEY;

async function run() {
  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "cogview-3",
      prompt: "A cute little kancil in watercolor style",
    })
  });
  const data = await res.json();
  console.log(data);
}
run();
