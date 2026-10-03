const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function generateMissingAudio() {
    console.log("Fetching published stories...");
    const { data: stories, error } = await supabase
        .from('stories')
        .select(`
            id,
            title,
            status,
            story_versions (
                id,
                status,
                adaptations (
                    age_band,
                    audio_status
                )
            )
        `)
        .eq('status', 'published');

    if (error) {
        console.error("Error fetching stories:", error);
        return;
    }

    let queuedCount = 0;

    for (const story of stories) {
        // Find published versions
        const publishedVersions = story.story_versions.filter(v => v.status === 'published');
        
        for (const version of publishedVersions) {
            const asliAdaptation = version.adaptations.find(a => a.age_band === 'asli');
            
            if (asliAdaptation && asliAdaptation.audio_status !== 'ready') {
                console.log(`- Queuing audio for: ${story.title} (Version: ${version.id}) - Current status: ${asliAdaptation.audio_status}`);
                
                const { error: rpcError } = await supabase.rpc('start_ai_process_run', {
                    p_version_id: version.id,
                    p_scope: 'audio_only',
                    p_config_snapshot: { source: 'mass_audio_generation_cli' }
                });

                if (rpcError) {
                    console.error(`  [!] Failed to queue ${story.title}:`, rpcError.message);
                } else {
                    console.log(`  [+] Successfully queued.`);
                    queuedCount++;
                }
            }
        }
    }

    console.log(`\nFinished! Queued audio generation for ${queuedCount} versions.`);
}

generateMissingAudio();
