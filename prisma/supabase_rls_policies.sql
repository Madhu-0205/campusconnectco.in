-- CampusConnect Supabase RLS policies and Database Security Hardening SQL Script
-- Run these statements in the Supabase SQL Editor to secure your PostgreSQL tables.

-- =========================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL SENSITIVE TABLES
-- =========================================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Follows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConnectionRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gigs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Escrow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TransactionAudit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dispute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PostLike" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSkill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GigSkill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedInternship" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Endorsement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Startup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResumeAnalysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CareerRoadmap" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserEmbedding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GigEmbedding" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on all missing tables
ALTER TABLE "Analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CampusDrive" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MockInterview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CopilotSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserGamification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "XpEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Badge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserBadge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CampusLeaderboard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Referral" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ambassador" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShareCard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Note: Static public tables (like Skill, Internship, Announcement, PlatformSetting)
-- can have RLS enabled with only SELECT allowed for all, restricting write operations to admins.
ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Internship" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlatformSetting" ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- 2. CREATE ROW LEVEL SECURITY POLICIES (Least Privilege)
-- =========================================================================

-- -------------------------------------------------------------------------
-- USER TABLE POLICIES
-- -------------------------------------------------------------------------
-- Users can view any other user's public profile (required for network browsing)
CREATE POLICY user_select_policy ON "User"
    FOR SELECT
    USING (true);

-- Only the user themselves can insert, update, or delete their profile record
CREATE POLICY user_modify_policy ON "User"
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- -------------------------------------------------------------------------
-- CONNECTION REQUEST POLICIES
-- -------------------------------------------------------------------------
-- Users can only view connection requests where they are the sender or the receiver
CREATE POLICY connection_select_policy ON "ConnectionRequest"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = "senderId" OR auth.uid() = "receiverId");

-- Users can only insert connection requests where they are the sender
CREATE POLICY connection_insert_policy ON "ConnectionRequest"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = "senderId");

-- Receiver can accept or reject requests
CREATE POLICY connection_update_receiver_policy ON "ConnectionRequest"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = "receiverId")
    WITH CHECK (auth.uid() = "receiverId" AND status IN ('ACCEPTED', 'REJECTED'));

-- Sender can only cancel their own request
CREATE POLICY connection_update_sender_policy ON "ConnectionRequest"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = "senderId")
    WITH CHECK (auth.uid() = "senderId" AND status = 'CANCELLED');

-- Only the sender can withdraw/delete their request
CREATE POLICY connection_delete_policy ON "ConnectionRequest"
    FOR DELETE
    TO authenticated
    USING (auth.uid() = "senderId");


-- -------------------------------------------------------------------------
-- GIG TABLE POLICIES
-- -------------------------------------------------------------------------
-- Anyone authenticated can browse/select gigs
CREATE POLICY gig_select_policy ON "gigs"
    FOR SELECT
    USING (true);

-- Only the gig creator can insert, update, or delete the gig
CREATE POLICY gig_modify_policy ON "gigs"
    FOR ALL
    TO authenticated
    USING (auth.uid() = "posted_by")
    WITH CHECK (auth.uid() = "posted_by");


-- -------------------------------------------------------------------------
-- APPLICATION TABLE POLICIES
-- -------------------------------------------------------------------------
-- Only the applicant or the gig creator who posted the gig can view applications
CREATE POLICY application_select_policy ON "applications"
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = "applicantId" OR 
        EXISTS (
            SELECT 1 FROM "gigs" 
            WHERE "gigs".id = "applications"."gigId" AND "gigs"."posted_by" = auth.uid()
        )
    );

-- Only the user themselves can submit an application
CREATE POLICY application_insert_policy ON "applications"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = "applicantId");

-- Senders can only update their cover letter if the status is PENDING
CREATE POLICY applicant_update_policy ON "applications"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = "applicantId")
    WITH CHECK (auth.uid() = "applicantId" AND status = 'PENDING');

-- Only the applicant can delete their application
CREATE POLICY application_delete_policy ON "applications"
    FOR DELETE
    TO authenticated
    USING (auth.uid() = "applicantId");


-- -------------------------------------------------------------------------
-- CONVERSATION & MESSAGE POLICIES (Private Chats)
-- -------------------------------------------------------------------------
-- Users can only see conversations they are part of
CREATE POLICY conversation_select_policy ON "Conversation"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = "participant_1" OR auth.uid() = "participant_2");

-- Users can create a conversation if they are participant_1 or participant_2
CREATE POLICY conversation_insert_policy ON "Conversation"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = "participant_1" OR auth.uid() = "participant_2");

-- Users can only see messages in conversations they belong to
CREATE POLICY message_select_policy ON "messages"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "Conversation" 
            WHERE "Conversation".id = "messages"."conversation_id" 
            AND ("Conversation"."participant_1" = auth.uid() OR "Conversation"."participant_2" = auth.uid())
        )
    );

-- Users can only send messages as themselves in their own conversations
CREATE POLICY message_insert_policy ON "messages"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = "sender_id" AND
        EXISTS (
            SELECT 1 FROM "Conversation" 
            WHERE "Conversation".id = "messages"."conversation_id" 
            AND ("Conversation"."participant_1" = auth.uid() OR "Conversation"."participant_2" = auth.uid())
        )
    );


-- -------------------------------------------------------------------------
-- ESCROW, TRANSACTION & DISPUTE POLICIES (High Security)
-- -------------------------------------------------------------------------
-- Clients and Workers can view their own escrows
CREATE POLICY escrow_select_policy ON "Escrow"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = "clientId" OR auth.uid() = "workerId");

-- Buyers and Sellers can view their transactions
CREATE POLICY transaction_select_policy ON "Transaction"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = "buyerId" OR auth.uid() = "sellerId");

-- Transaction audits are readable only by admins or participants
CREATE POLICY audit_select_policy ON "TransactionAudit"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "Transaction"
            WHERE "Transaction".id = "TransactionAudit"."transactionId"
            AND ("Transaction"."buyerId" = auth.uid() OR "Transaction"."sellerId" = auth.uid())
        )
    );

-- Disputes are readable only by transaction participants
CREATE POLICY dispute_select_policy ON "Dispute"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "Transaction"
            WHERE "Transaction".id = "Dispute"."transactionId"
            AND ("Transaction"."buyerId" = auth.uid() OR "Transaction"."sellerId" = auth.uid())
        )
    );

-- Critical: Direct modification (INSERT, UPDATE, DELETE) of escrows and transactions 
-- is NOT permitted from client-side SDKs. They must only be mutated via server-side endpoints 
-- (which use service role or direct Prisma PostgreSQL connections that bypass RLS).
-- Therefore, we write NO insert/update/delete policies for these tables (default deny).


-- -------------------------------------------------------------------------
-- POSTS & FEED POLICIES
-- -------------------------------------------------------------------------
-- Anyone authenticated can view posts and likes
CREATE POLICY post_select_policy ON "Post" FOR SELECT TO authenticated USING (true);
CREATE POLICY post_like_select_policy ON "PostLike" FOR SELECT TO authenticated USING (true);

-- Only author can write/delete posts
CREATE POLICY post_modify_policy ON "Post"
    FOR ALL
    TO authenticated
    USING (auth.uid() = "authorId")
    WITH CHECK (auth.uid() = "authorId");

-- Only user can like/unlike
CREATE POLICY post_like_modify_policy ON "PostLike"
    FOR ALL
    TO authenticated
    USING (auth.uid() = "userId")
    WITH CHECK (auth.uid() = "userId");


-- -------------------------------------------------------------------------
-- RESUME ANALYSIS, CAREER ROADMAP & PROJECTS POLICIES
-- -------------------------------------------------------------------------
CREATE POLICY project_select_policy ON "Project" FOR SELECT TO authenticated USING (true);
CREATE POLICY project_modify_policy ON "Project" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY resume_select_policy ON "ResumeAnalysis" FOR SELECT TO authenticated USING (auth.uid() = "userId");
CREATE POLICY resume_modify_policy ON "ResumeAnalysis" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY roadmap_select_policy ON "CareerRoadmap" FOR SELECT TO authenticated USING (auth.uid() = "userId");
CREATE POLICY roadmap_modify_policy ON "CareerRoadmap" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");


-- -------------------------------------------------------------------------
-- STATIC REFERENCE TABLES (Read-Only to Public)
-- -------------------------------------------------------------------------
CREATE POLICY skill_read_policy ON "Skill" FOR SELECT TO authenticated USING (true);
CREATE POLICY internship_read_policy ON "Internship" FOR SELECT USING (true);
CREATE POLICY announcement_read_policy ON "Announcement" FOR SELECT TO authenticated USING (true);
CREATE POLICY settings_read_policy ON "PlatformSetting" FOR SELECT TO authenticated USING (true);
-- Note: Write actions on these reference tables default to deny for standard users.


-- -------------------------------------------------------------------------
-- POLICIES FOR NEW TABLES (ORGANIZATION, MEMBER, GAMIFICATION, GROWTH, ETC.)
-- -------------------------------------------------------------------------
-- Organization: Anyone can read, updates restricted to admin/owner roles via API
CREATE POLICY organization_select_policy ON "Organization" FOR SELECT USING (true);

-- Member: Read only for members, modifications restricted to OWNER/ADMIN via API
CREATE POLICY member_select_policy ON "Member" FOR SELECT TO authenticated
    USING (auth.uid() = "userId" OR EXISTS (
        SELECT 1 FROM "Member" m WHERE m."organizationId" = "Member"."organizationId" AND m."userId" = auth.uid()
    ));

-- Subscription: Read-only for organization members
CREATE POLICY subscription_select_policy ON "Subscription" FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM "Member" WHERE "Member"."organizationId" = "Subscription"."organizationId" AND "Member"."userId" = auth.uid()
    ));

-- CampusDrive: Read-only for authenticated
CREATE POLICY drive_select_policy ON "CampusDrive" FOR SELECT TO authenticated USING (true);

-- MockInterview & CopilotSession: Private ownership only
CREATE POLICY mock_interview_select_policy ON "MockInterview" FOR SELECT TO authenticated USING (auth.uid() = "userId");
CREATE POLICY mock_interview_modify_policy ON "MockInterview" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY copilot_session_select_policy ON "CopilotSession" FOR SELECT TO authenticated USING (auth.uid() = "userId");
CREATE POLICY copilot_session_modify_policy ON "CopilotSession" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

-- UserGamification, XpEvent, Badge, UserBadge
CREATE POLICY gamification_select_policy ON "UserGamification" FOR SELECT USING (true);
CREATE POLICY xp_event_select_policy ON "XpEvent" FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM "UserGamification" WHERE "UserGamification".id = "XpEvent"."gamificationId" AND "UserGamification"."userId" = auth.uid())
);
CREATE POLICY badge_select_policy ON "Badge" FOR SELECT TO authenticated USING (true);
CREATE POLICY user_badge_select_policy ON "UserBadge" FOR SELECT TO authenticated USING (true);

-- Referral & Ambassador
CREATE POLICY referral_select_policy ON "Referral" FOR SELECT TO authenticated USING (auth.uid() = "referrerId" OR auth.uid() = "refereeId");
CREATE POLICY ambassador_select_policy ON "Ambassador" FOR SELECT USING (true);

-- ShareCard
CREATE POLICY share_card_select_policy ON "ShareCard" FOR SELECT USING (true);
CREATE POLICY share_card_modify_policy ON "ShareCard" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

-- Notification
CREATE POLICY notification_select_policy ON "Notification" FOR SELECT TO authenticated USING (auth.uid() = "userId");

-- GrowthEvent
ALTER TABLE "GrowthEvent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY growth_event_select_policy ON "GrowthEvent" FOR SELECT TO authenticated USING (auth.uid() = "userId");

-- UserSkill
CREATE POLICY userskill_select_policy ON "UserSkill" FOR SELECT USING (true);
CREATE POLICY userskill_modify_policy ON "UserSkill" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

-- GigSkill
CREATE POLICY gigskill_select_policy ON "GigSkill" FOR SELECT USING (true);
CREATE POLICY gigskill_modify_policy ON "GigSkill" FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM "gigs" WHERE "gigs".id = "GigSkill"."gigId" AND "gigs"."posted_by" = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM "gigs" WHERE "gigs".id = "GigSkill"."gigId" AND "gigs"."posted_by" = auth.uid()));

-- SavedInternship
CREATE POLICY saved_internship_select_policy ON "SavedInternship" FOR SELECT TO authenticated USING (auth.uid() = "userId");
CREATE POLICY saved_internship_modify_policy ON "SavedInternship" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

-- Review
CREATE POLICY review_select_policy ON "Review" FOR SELECT USING (true);
CREATE POLICY review_insert_policy ON "Review" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "reviewerId");

-- Endorsement
CREATE POLICY endorsement_select_policy ON "Endorsement" FOR SELECT USING (true);
CREATE POLICY endorsement_insert_policy ON "Endorsement" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "endorserId");
CREATE POLICY endorsement_delete_policy ON "Endorsement" FOR DELETE TO authenticated USING (auth.uid() = "endorserId");

-- Task
CREATE POLICY task_select_policy ON "Task" FOR SELECT TO authenticated USING (auth.uid() = "userId");
CREATE POLICY task_modify_policy ON "Task" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

-- Startup
CREATE POLICY startup_select_policy ON "Startup" FOR SELECT USING (true);
CREATE POLICY startup_modify_policy ON "Startup" FOR ALL TO authenticated USING (auth.uid() = "founderId") WITH CHECK (auth.uid() = "founderId");

-- AI Embeddings
CREATE POLICY user_embedding_select_policy ON "UserEmbedding" FOR SELECT TO authenticated USING (true);
CREATE POLICY gig_embedding_select_policy ON "GigEmbedding" FOR SELECT TO authenticated USING (true);

-- =========================================================================
-- 3. SUPABASE STORAGE BUCKET POLICIES (Avatars Bucket Security)
-- =========================================================================

-- Enable storage security on buckets
-- Assuming bucket 'avatars' is created.

-- Policy A: Anyone can view profile avatar pictures (Public Read)
CREATE POLICY "Public Read Avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Policy B: Authenticated users can upload avatars only to their own folders or files prefixed with their ID
CREATE POLICY "Users can upload their own avatars"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
        -- OR checks matching filenames like 'userid-random.jpg'
        OR name LIKE auth.uid()::text || '-%'
    );

-- Policy C: Users can update/delete their own avatars
CREATE POLICY "Users can modify their own avatars"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND ((storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '-%')
    );

CREATE POLICY "Users can delete their own avatars"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND ((storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '-%')
    );

-- =========================================================================
-- 4. EXPLICIT DB PRIVILEGE GRANTS FOR SUPABASE ROLES (Restricted)
-- =========================================================================
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM authenticated, anon;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM authenticated, anon;

-- Explicitly allow public access only to non-sensitive tables
GRANT SELECT ON "gigs", "User", "Project", "Post", "PostLike", "Skill", "Internship", "Announcement", "PlatformSetting", "CampusLeaderboard" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- =========================================================================
-- 5. PERFORMANCE INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_gigs_posted_by ON "gigs"("posted_by");
CREATE INDEX IF NOT EXISTS idx_applications_applicantId ON "applications"("applicantId");
CREATE INDEX IF NOT EXISTS idx_applications_gigId ON "applications"("gigId");
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON "messages"("conversation_id");
CREATE INDEX IF NOT EXISTS idx_connection_request_sender ON "ConnectionRequest"("senderId");
CREATE INDEX IF NOT EXISTS idx_connection_request_receiver ON "ConnectionRequest"("receiverId");
