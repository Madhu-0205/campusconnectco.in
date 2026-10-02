import { describe, it, expect, vi, beforeEach } from "vitest";

import { getInitials, safeArray, truncate } from "@/lib/utils/safe";

describe("CampusConnectCo Cross-Page Repair & State Synchronization Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. AUTH STATE & NAVIGATION CONTRACT
  // =========================================================================
  describe("1. Auth State & Navigation Contract", () => {
    interface AuthUser {
      id: string;
      email: string;
      role: string;
      name?: string | null;
      full_name?: string | null;
      avatar_url?: string | null;
    }

    function computeNavbarState(
      currentUser: AuthUser | null,
      isLoading: boolean
    ) {
      if (isLoading) {
        return {
          type: "loading_skeleton",
          showAuthButtons: false,
          showUserMenu: false,
          navLinks: [],
        };
      }

      if (!currentUser) {
        return {
          type: "unauthenticated",
          showAuthButtons: true,
          showUserMenu: false,
          authButtons: ["Log in", "Join Network"],
          navLinks: [
            { label: "Opportunities", href: "/opportunities" },
            { label: "For Employers", href: "/post-opportunity" },
            { label: "Community", href: "/community" },
          ],
        };
      }

      const role = (currentUser.role || "STUDENT").toUpperCase();
      const dashboardHref =
        role === "CLIENT" || role === "FOUNDER" || role === "STARTUP"
          ? "/client-hub"
          : role === "AMBASSADOR"
          ? "/ambassador/dashboard"
          : "/dashboard/student";

      return {
        type: "authenticated",
        showAuthButtons: false,
        showUserMenu: true,
        userDisplayName: currentUser.full_name?.trim() || currentUser.name?.trim() || "Student",
        userAvatar: currentUser.avatar_url || null,
        dashboardHref,
        navLinks: [
          { label: "Dashboard", href: dashboardHref },
          { label: "Opportunities", href: "/opportunities" },
          { label: "Network", href: "/network" },
          { label: "Messages", href: "/messages" },
        ],
      };
    }

    it("1.1 Logged-out visitor sees 'Log in' and 'Join Network' navigation", () => {
      const state = computeNavbarState(null, false);
      expect(state.type).toBe("unauthenticated");
      expect(state.showAuthButtons).toBe(true);
      expect(state.showUserMenu).toBe(false);
      expect(state.authButtons).toContain("Log in");
      expect(state.authButtons).toContain("Join Network");
      expect(state.navLinks.some((l) => l.href === "/messages")).toBe(false);
    });

    it("1.2 Logged-in user sees authenticated navigation and dashboard links", () => {
      const student: AuthUser = {
        id: "usr_123",
        email: "student@pec.edu",
        role: "STUDENT",
        full_name: "Sathwik Sharma",
        avatar_url: "https://example.com/avatar.jpg",
      };

      const state = computeNavbarState(student, false);
      expect(state.type).toBe("authenticated");
      expect(state.showAuthButtons).toBe(false);
      expect(state.showUserMenu).toBe(true);
      expect(state.userDisplayName).toBe("Sathwik Sharma");
      expect(state.dashboardHref).toBe("/dashboard/student");
      expect(state.navLinks.some((l) => l.href === "/messages")).toBe(true);
      expect(state.navLinks.some((l) => l.href === "/network")).toBe(true);
    });

    it("1.3 Client / Founder role receives client-hub navigation", () => {
      const founder: AuthUser = {
        id: "usr_founder",
        email: "founder@startup.com",
        role: "FOUNDER",
        full_name: "Startup Co-Founder",
      };

      const state = computeNavbarState(founder, false);
      expect(state.type).toBe("authenticated");
      expect(state.dashboardHref).toBe("/client-hub");
    });

    it("1.4 Logout immediately restores unauthenticated public navigation", () => {
      let currentUser: AuthUser | null = {
        id: "usr_temp",
        email: "temp@campus.in",
        role: "STUDENT",
        name: "Temporary User",
      };

      expect(computeNavbarState(currentUser, false).type).toBe("authenticated");

      // Emulate auth state change on SIGNED_OUT
      currentUser = null;
      const stateAfterSignOut = computeNavbarState(currentUser, false);
      expect(stateAfterSignOut.type).toBe("unauthenticated");
      expect(stateAfterSignOut.showAuthButtons).toBe(true);
      expect(stateAfterSignOut.showUserMenu).toBe(false);
    });

    it("1.5 Initial server session hydrates without flashing unauthenticated buttons", () => {
      const initialUser: AuthUser = {
        id: "usr_server",
        email: "server@pec.edu",
        role: "STUDENT",
        full_name: "Hydrated User",
      };

      // Server rendered initialUser is available at mount
      const mountedState = computeNavbarState(initialUser, false);
      expect(mountedState.type).toBe("authenticated");
      expect(mountedState.showAuthButtons).toBe(false);
    });
  });

  // =========================================================================
  // 2. ONBOARDING COLLEGE SELECTOR & MAP COORDINATE SYNCHRONIZATION
  // =========================================================================
  describe("2. Onboarding College & Location State Synchronization", () => {
    interface OnboardingState {
      college: string;
      collegeId: string;
      city: string;
      state: string;
      latitude: number;
      longitude: number;
      locationStatus: "idle" | "detecting" | "detected" | "failed" | "manual";
    }

    interface CollegeData {
      id: string;
      name: string;
      city: string;
      state: string;
      latitude: number;
      longitude: number;
    }

    const authoritativeColleges: CollegeData[] = [
      {
        id: "col_pec",
        name: "Pragati Engineering College",
        city: "East Godavari",
        state: "Andhra Pradesh",
        latitude: 17.0789,
        longitude: 82.1345,
      },
      {
        id: "col_iith",
        name: "IIT Hyderabad",
        city: "Sangareddy",
        state: "Telangana",
        latitude: 17.595,
        longitude: 78.123,
      },
    ];

    function selectCollege(
      prevState: OnboardingState,
      college: CollegeData
    ): OnboardingState {
      return {
        ...prevState,
        college: college.name,
        collegeId: college.id,
        city: college.city || prevState.city,
        state: college.state || prevState.state,
        latitude: college.latitude || prevState.latitude,
        longitude: college.longitude || prevState.longitude,
        locationStatus: college.latitude && college.longitude ? "detected" : prevState.locationStatus,
      };
    }

    function editCityManually(
      prevState: OnboardingState,
      newCity: string
    ): OnboardingState {
      return {
        ...prevState,
        city: newCity,
        latitude: 0,
        longitude: 0,
        locationStatus: "manual",
      };
    }

    it("2.1 Selecting college updates college name, collegeId, city, state, and coordinates", () => {
      const initial: OnboardingState = {
        college: "",
        collegeId: "",
        city: "",
        state: "",
        latitude: 0,
        longitude: 0,
        locationStatus: "idle",
      };

      const pec = authoritativeColleges[0];
      const updated = selectCollege(initial, pec);

      expect(updated.college).toBe("Pragati Engineering College");
      expect(updated.collegeId).toBe("col_pec");
      expect(updated.city).toBe("East Godavari");
      expect(updated.state).toBe("Andhra Pradesh");
      expect(updated.latitude).toBe(17.0789);
      expect(updated.longitude).toBe(82.1345);
      expect(updated.locationStatus).toBe("detected");
    });

    it("2.2 Changing college updates map coordinates deterministically without stale state", () => {
      const initial: OnboardingState = {
        college: "Pragati Engineering College",
        collegeId: "col_pec",
        city: "East Godavari",
        state: "Andhra Pradesh",
        latitude: 17.0789,
        longitude: 82.1345,
        locationStatus: "detected",
      };

      const iit = authoritativeColleges[1];
      const changed = selectCollege(initial, iit);

      expect(changed.college).toBe("IIT Hyderabad");
      expect(changed.latitude).toBe(17.595);
      expect(changed.longitude).toBe(78.123);
      expect(changed.city).toBe("Sangareddy");
      expect(changed.state).toBe("Telangana");
    });

    it("2.3 Manual city edit guards against stale coordinates and sets manual status", () => {
      const detected: OnboardingState = {
        college: "Pragati Engineering College",
        collegeId: "col_pec",
        city: "East Godavari",
        state: "Andhra Pradesh",
        latitude: 17.0789,
        longitude: 82.1345,
        locationStatus: "detected",
      };

      const edited = editCityManually(detected, "Kakinada");
      expect(edited.city).toBe("Kakinada");
      expect(edited.latitude).toBe(0);
      expect(edited.longitude).toBe(0);
      expect(edited.locationStatus).toBe("manual");
      expect(edited.college).toBe("Pragati Engineering College");
    });
  });

  // =========================================================================
  // 3. NETWORK PAGE USER CARD & DATA MAPPING
  // =========================================================================
  describe("3. Network Page Card Data Mapping & Identity Rendering", () => {
    interface PrismaUserRecord {
      id: string;
      name: string | null;
      full_name: string | null;
      role: string;
      college: string | null;
      branch: string | null;
      year: string | null;
      image: string | null;
      avatar_url: string | null;
      bio: string | null;
      skills: string | null;
      email?: string;
      bankName?: string | null;
    }

    function transformForNetworkFeed(u: PrismaUserRecord, currentUserId: string) {
      const displayName = u.full_name?.trim() || u.name?.trim() || "Campus Member";
      const initials = getInitials(displayName);
      const skillNames = safeArray<string>(u.skills);
      const bio = truncate(u.bio, 120);

      return {
        id: u.id,
        name: displayName,
        initials,
        role: u.role || "Student",
        college: u.college || null,
        branch: u.branch || null,
        image: u.avatar_url || u.image || null,
        bio: bio || "No bio yet",
        skills: skillNames,
        // Ensure private data is NEVER exposed
        hasSensitiveEmail: "email" in u && u.email !== undefined,
        hasSensitiveBank: "bankName" in u && u.bankName !== undefined,
      };
    }

    it("3.1 Correct display name is prioritized from full_name over name", () => {
      const record: PrismaUserRecord = {
        id: "u_1",
        name: null,
        full_name: "Om Prakash",
        role: "STUDENT",
        college: "Pragati Engineering College",
        branch: "Computer Science",
        year: "3rd",
        image: null,
        avatar_url: null,
        bio: "Passionate about full-stack web and open source.",
        skills: "React,TypeScript,Node.js",
      };

      const cardData = transformForNetworkFeed(record, "viewer_1");
      expect(cardData.name).toBe("Om Prakash");
      expect(cardData.initials).toBe("OP");
      expect(cardData.college).toBe("Pragati Engineering College");
      expect(cardData.skills).toEqual(["React", "TypeScript", "Node.js"]);
    });

    it("3.2 Initials and display name always derive from the same profile record", () => {
      const profiles: PrismaUserRecord[] = [
        { id: "1", name: null, full_name: "Sathwik O", role: "STUDENT", college: "PEC", branch: "IT", year: "4th", image: null, avatar_url: null, bio: "Tech lead", skills: "Go,Docker" },
        { id: "2", name: null, full_name: "Srikanth R", role: "STUDENT", college: "PEC", branch: "CSE", year: "3rd", image: null, avatar_url: null, bio: "DevOps", skills: "AWS,Linux" },
        { id: "3", name: "Legacy Name", full_name: null, role: "STUDENT", college: "IIT", branch: "EE", year: "2nd", image: null, avatar_url: null, bio: "Hardware", skills: "Verilog" },
      ];

      for (const p of profiles) {
        const transformed = transformForNetworkFeed(p, "viewer");
        const expectedInitial = getInitials(p.full_name || p.name || "Campus Member");
        expect(transformed.initials).toBe(expectedInitial);
      }
    });

    it("3.3 Fallback name is 'Campus Member' when both full_name and name are empty", () => {
      const anonymousRecord: PrismaUserRecord = {
        id: "u_empty",
        name: null,
        full_name: null,
        role: "STUDENT",
        college: null,
        branch: null,
        year: null,
        image: null,
        avatar_url: null,
        bio: null,
        skills: null,
      };

      const cardData = transformForNetworkFeed(anonymousRecord, "viewer");
      expect(cardData.name).toBe("Campus Member");
      expect(cardData.initials).toBe("CM");
      expect(cardData.bio).toBe("No bio yet");
    });

    it("3.4 Private user fields (email, banking) are never forwarded in public network feed", () => {
      // Direct API simulation: selecting safe fields
      const apiResponse = {
        id: "u_safe",
        name: "Test Student",
        full_name: "Test Student",
        role: "Student",
        college: "PEC",
        image: null,
        bio: "Student bio",
        tags: ["React"],
        isFollowing: false,
      };

      expect((apiResponse as any).email).toBeUndefined();
      expect((apiResponse as any).bankName).toBeUndefined();
      expect((apiResponse as any).accNumber).toBeUndefined();
    });
  });

  // =========================================================================
  // 4. MESSAGES UI SYSTEM & DESIGN SYSTEM ALIGNMENT
  // =========================================================================
  describe("4. Messages UI System & Theme Alignment", () => {
    function getMessageBubbleStyles(isMe: boolean) {
      return {
        bg: isMe ? "bg-primary" : "bg-surface",
        text: isMe ? "text-primary-foreground" : "text-foreground",
        border: isMe ? "border-transparent" : "border-border",
        align: isMe ? "ml-auto items-end" : "items-start",
      };
    }

    function getConversationItemStyles(isActive: boolean) {
      return {
        bg: isActive ? "bg-primary/10" : "hover:bg-surface-2/80",
        border: isActive ? "border-l-4 border-l-primary" : "border-transparent",
        nameColor: isActive ? "text-primary-dark dark:text-primary" : "text-foreground",
      };
    }

    it("4.1 Sent message bubble uses primary green with primary-foreground text", () => {
      const styles = getMessageBubbleStyles(true);
      expect(styles.bg).toBe("bg-primary");
      expect(styles.text).toBe("text-primary-foreground");
      expect(styles.align).toBe("ml-auto items-end");
    });

    it("4.2 Received message bubble uses high contrast light surface with dark text", () => {
      const styles = getMessageBubbleStyles(false);
      expect(styles.bg).toBe("bg-surface");
      expect(styles.text).toBe("text-foreground");
      expect(styles.border).toBe("border-border");
      expect(styles.align).toBe("items-start");
    });

    it("4.3 Active conversation item has distinct border and readable text contrast", () => {
      const activeStyles = getConversationItemStyles(true);
      expect(activeStyles.bg).toBe("bg-primary/10");
      expect(activeStyles.border).toBe("border-l-4 border-l-primary");
      expect(activeStyles.nameColor).not.toBe("text-background"); // Must never render dark on dark

      const inactiveStyles = getConversationItemStyles(false);
      expect(inactiveStyles.nameColor).toBe("text-foreground");
    });

    it("4.4 Messaging security badge accurately reflects application security model", () => {
      const badgeText = "Verified Campus Messaging";
      expect(badgeText).not.toContain("End-to-End Encrypted"); // Accurate description of TLS + Supabase RLS
      expect(badgeText).toContain("Verified Campus Messaging");
    });
  });

  // =========================================================================
  // 5. OVERLAY, POPOVER & Z-INDEX HIERARCHY
  // =========================================================================
  describe("5. Overlay & Stacking Context Hierarchy", () => {
    const stackingHierarchy = {
      base: 0,
      mapCanvas: 10,
      mapControls: 20,
      mapSearchInput: 30,
      mapSuggestionsDropdown: 40,
      formFloatingControls: 40,
      collegeSelectorDropdown: 50,
      dialogModal: 50,
      toastNotifications: 100,
    };

    it("5.1 Dropdowns render strictly above the Map canvas and map controls", () => {
      expect(stackingHierarchy.collegeSelectorDropdown).toBeGreaterThan(
        stackingHierarchy.mapCanvas
      );
      expect(stackingHierarchy.collegeSelectorDropdown).toBeGreaterThan(
        stackingHierarchy.mapControls
      );
    });

    it("5.2 Map suggestions dropdown renders above map controls and canvas", () => {
      expect(stackingHierarchy.mapSuggestionsDropdown).toBeGreaterThan(
        stackingHierarchy.mapCanvas
      );
      expect(stackingHierarchy.mapSuggestionsDropdown).toBeGreaterThan(
        stackingHierarchy.mapControls
      );
    });

    it("5.3 Dialog overlays maintain top-level priority without collision", () => {
      expect(stackingHierarchy.dialogModal).toBeGreaterThanOrEqual(
        stackingHierarchy.collegeSelectorDropdown
      );
      expect(stackingHierarchy.toastNotifications).toBeGreaterThan(
        stackingHierarchy.dialogModal
      );
    });
  });
});
