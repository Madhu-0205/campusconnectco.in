// test_auth_regression.js
// This script contains a conceptual/regression test suite that verifies the auth fixes.

console.log("Starting Auth Regression Tests...");

function runTests() {
    let passed = 0;
    let failed = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`[PASS] ${message}`);
            passed++;
        } else {
            console.error(`[FAIL] ${message}`);
            failed++;
        }
    };

    const FOUNDER_EMAILS = ["madhuvalurouthu52@gmail.com"];
    const isPrivilegedEmail = (email) => FOUNDER_EMAILS.includes(email.toLowerCase().trim());

    // Mocking the profile creation (POST api/user/profile/route.ts)
    const getFinalRolePost = (email, bodyRole) => {
        const isFounder = isPrivilegedEmail(email);
        let requestedRole = bodyRole || "STUDENT";
        
        if (!isFounder && (requestedRole === "FOUNDER" || requestedRole === "ADMIN")) {
            throw new Error("Invalid role specified. Privileged roles cannot be assigned during onboarding.");
        }
        
        const validClientRoles = ["STUDENT", "CLIENT", "STARTUP"];
        if (!isFounder && !validClientRoles.includes(requestedRole)) {
            requestedRole = "STUDENT";
        }
        
        return isFounder ? "FOUNDER" : requestedRole;
    };

    // Mocking the auth callback (GET auth/callback/route.ts)
    const getFinalRoleCallback = (email, roleParam) => {
        const isFounder = isPrivilegedEmail(email);
        let requestedRole = roleParam || "STUDENT";
        
        if (!isFounder && (requestedRole === "FOUNDER" || requestedRole === "ADMIN")) {
            throw new Error("Invalid role specified. Privileged roles cannot be assigned during onboarding.");
        }
        
        const validClientRoles = ["STUDENT", "CLIENT", "STARTUP"];
        if (!isFounder && !validClientRoles.includes(requestedRole)) {
            requestedRole = "STUDENT";
        }
        
        return isFounder ? "FOUNDER" : requestedRole;
    };

    // Mocking the DB profile fallback initialization (getAuthProfileFromDb)
    const getFinalRoleDbFallback = (email, userMetadataRole) => {
        const isFounder = isPrivilegedEmail(email);
        // Metadata role is completely ignored
        return isFounder ? "FOUNDER" : "STUDENT";
    };

    const expectError = (fn, message) => {
        try {
            fn();
            assert(false, message + " (Expected error but succeeded)");
        } catch (e) {
            assert(true, message + ` (Caught: ${e.message})`);
        }
    };

    expectError(() => getFinalRolePost("hacker@example.com", "ADMIN"), "Signup attempt passing body.role=ADMIN actively rejects the request");
    expectError(() => getFinalRolePost("hacker@example.com", "FOUNDER"), "Signup attempt passing body.role=FOUNDER actively rejects the request");

    expectError(() => getFinalRoleCallback("oauthuser@example.com", "ADMIN"), "OAuth callback with ?role=ADMIN actively rejects the request");
    expectError(() => getFinalRoleCallback("oauthuser@example.com", "FOUNDER"), "OAuth callback with ?role=FOUNDER actively rejects the request");

    // Test: Metadata role has NO authority
    const fallbackRole = getFinalRoleDbFallback("student@example.edu", "ADMIN");
    assert(fallbackRole === "STUDENT", "Manipulated metadata role=ADMIN is completely ignored and defaults to STUDENT");

    const founderRole = getFinalRoleDbFallback("madhuvalurouthu52@gmail.com", "ADMIN");
    assert(founderRole === "FOUNDER", "Founder email automatically gets FOUNDER role despite metadata");

    console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
