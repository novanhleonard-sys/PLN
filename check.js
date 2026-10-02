const url = "https://jnmucqbtdzgafuuaowyo.supabase.co/rest/v1/jobs?kind=eq.translate&order=created_at.desc&limit=2";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpubXVjcWJ0ZHpnYWZ1dWFvd3lvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE1ODg2MCwiZXhwIjoyMTA1NzM0ODYwfQ.K9lvH20b8cRz8cbg3bAVQ6sSjczNS_-K1dvk7AeKmBw";

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
