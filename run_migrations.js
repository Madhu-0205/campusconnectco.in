const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Inserting resumes bucket...");
        // Use executeRawUnsafe for these Postgres-specific commands
        await prisma.$executeRawUnsafe(`
            INSERT INTO storage.buckets (id, name, public) 
            VALUES ('resumes', 'resumes', false) 
            ON CONFLICT (id) DO NOTHING;
        `);

        console.log("Creating policies...");
        // 1. Upload policy: Only authenticated users can upload to their own folder.
        // We use DO logic to avoid errors if policy exists.
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policy p 
                    JOIN pg_class c ON p.polrelid = c.oid 
                    JOIN pg_namespace n ON c.relnamespace = n.oid 
                    WHERE n.nspname = 'storage' AND c.relname = 'objects' AND p.polname = 'Resume owners can upload'
                ) THEN
                    CREATE POLICY "Resume owners can upload" 
                    ON storage.objects FOR INSERT 
                    TO authenticated 
                    WITH CHECK (
                        bucket_id = 'resumes' AND 
                        (storage.foldername(name))[1] = auth.uid()::text
                    );
                END IF;
            END
            $$;
        `);

        // 2. Delete policy: Only owner can delete their own resumes
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policy p 
                    JOIN pg_class c ON p.polrelid = c.oid 
                    JOIN pg_namespace n ON c.relnamespace = n.oid 
                    WHERE n.nspname = 'storage' AND c.relname = 'objects' AND p.polname = 'Resume owners can delete'
                ) THEN
                    CREATE POLICY "Resume owners can delete" 
                    ON storage.objects FOR DELETE 
                    TO authenticated 
                    USING (
                        bucket_id = 'resumes' AND 
                        (storage.foldername(name))[1] = auth.uid()::text
                    );
                END IF;
            END
            $$;
        `);
        
        // 3. Select policy: DENY ALL for regular users. Wait, if we don't define a select policy, 
        // it denies all by default. But just to be explicit (or rely on default deny):
        // Default deny is active because there are OTHER policies on storage.objects.
        
        console.log("Migration complete!");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
