require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testStorage() {
    console.log("--- TESTING STORAGE ---");
    // Test 1: Anonymous list of resumes
    const { data: listData, error: listError } = await supabase.storage.from('resumes').list();
    console.log("Anonymous list resumes error:", listError ? listError.message : "Success");

    // Test 2: Anonymous upload to resumes
    const { data: uploadData, error: uploadError } = await supabase.storage.from('resumes').upload('test.txt', 'hello');
    console.log("Anonymous upload resumes error:", uploadError ? uploadError.message : "Success");
}

async function testRealtime() {
    console.log("\n--- TESTING REALTIME ---");
    // Test 1: Anonymous subscribe to messages
    return new Promise((resolve) => {
        const channel = supabase.channel('public:messages');
        channel.on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
            console.log("Received realtime payload:", payload);
        }).subscribe((status) => {
            console.log("Realtime subscribe status:", status);
            if (status === 'SUBSCRIBED' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                setTimeout(() => {
                    supabase.removeChannel(channel);
                    resolve();
                }, 2000);
            }
        });
    });
}

async function main() {
    await testStorage();
    await testRealtime();
}
main();
