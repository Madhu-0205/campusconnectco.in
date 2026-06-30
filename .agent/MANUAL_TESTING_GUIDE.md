# 🧪 Manual Testing Guide - Step by Step

**Date:** February 14, 2026  
**Server:** Running at http://localhost:3000  
**Estimated Time:** 30-45 minutes

---

## 🎯 Testing Objectives

Test all 3 new features:
1. ✅ Enhanced Navigation System
2. ✅ Forgot Password Flow
3. ✅ Global Search Functionality

---

## 📋 Pre-Testing Checklist

- [x] Development server is running
- [ ] Browser is open (Chrome recommended)
- [ ] Browser console is open (F12)
- [ ] You have a test email account ready
- [ ] You have test user credentials

---

## 🧭 Test 1: Enhanced Navigation System

### Test 1.1: Homepage Navigation
**URL:** http://localhost:3000

**Steps:**
1. Open http://localhost:3000 in your browser
2. Look at the top navigation bar

**Expected Results:**
- [ ] Navigation bar is visible at the top
- [ ] "CampusConnect" logo/brand name on the left
- [ ] Navigation menu items in the center
- [ ] Search bar visible (desktop)
- [ ] Profile icon on the right
- [ ] Theme toggle button visible
- [ ] No console errors

**Screenshot Location:** Take a screenshot and save as `test-nav-desktop.png`

---

### Test 1.2: Active Page Indicator
**Steps:**
1. Click on "Home" in the navigation
2. Observe the Home menu item
3. Click on "About" in the navigation
4. Observe the About menu item

**Expected Results:**
- [ ] Active page has different styling (highlighted)
- [ ] Active page has a small dot indicator below it
- [ ] Inactive pages are grayed out
- [ ] Smooth animation when switching pages

**Notes:** _______________________________________

---

### Test 1.3: Breadcrumb Navigation
**Steps:**
1. Navigate to any nested page (e.g., /dashboard/student)
2. Look below the main navigation bar

**Expected Results:**
- [ ] Breadcrumb trail is visible (desktop only)
- [ ] Shows: Home > Dashboard > Student
- [ ] Each segment is clickable
- [ ] Current page is highlighted in electric blue

**Notes:** _______________________________________

---

### Test 1.4: Mobile Navigation
**Steps:**
1. Resize browser to mobile width (375px) or use DevTools mobile view
2. Look for hamburger menu icon (☰)
3. Click the hamburger icon
4. Observe the mobile menu

**Expected Results:**
- [ ] Hamburger icon visible on mobile
- [ ] Desktop menu items hidden on mobile
- [ ] Mobile menu slides in smoothly
- [ ] All navigation items visible in mobile menu
- [ ] Active page highlighted in mobile menu
- [ ] Menu closes when clicking outside

**Screenshot Location:** Take a screenshot and save as `test-nav-mobile.png`

---

### Test 1.5: Search Bar Functionality
**Steps:**
1. Click on the search bar in the header
2. Type "react" and press Enter
3. Observe what happens

**Expected Results:**
- [ ] Search bar is clickable
- [ ] Can type in the search bar
- [ ] Pressing Enter redirects to /search?q=react
- [ ] Search results page loads

**Notes:** _______________________________________

---

### Test 1.6: Role-Based Menus

**Test with Student Account:**
1. Sign in as a student
2. Observe navigation menu items

**Expected Results:**
- [ ] See: Dashboard, Find Gigs, Internships, Wallet
- [ ] All links work correctly
- [ ] Active page highlights correctly

**Test with Client Account:**
1. Sign in as a client
2. Observe navigation menu items

**Expected Results:**
- [ ] See: Dashboard, Post Gig, Applicants, Payments
- [ ] All links work correctly

**Test with Founder Account:**
1. Sign in as founder
2. Observe navigation menu items

**Expected Results:**
- [ ] See: Founder Hub, Users, Approvals, Reports
- [ ] All links work correctly

**Notes:** _______________________________________

---

## 🔐 Test 2: Forgot Password Flow

### Test 2.1: Access Forgot Password Page
**URL:** http://localhost:3000/auth/signin

**Steps:**
1. Navigate to the sign-in page
2. Look for "Forgot Password?" link
3. Click the link

**Expected Results:**
- [ ] "Forgot Password?" link is visible below password field
- [ ] Link is styled in teal color
- [ ] Clicking redirects to /auth/forgot-password
- [ ] Forgot password page loads successfully

**Screenshot Location:** Take a screenshot and save as `test-forgot-password-link.png`

---

### Test 2.2: Request Password Reset
**URL:** http://localhost:3000/auth/forgot-password

**Steps:**
1. On the forgot password page, observe the UI
2. Enter a valid email address (use your test email)
3. Click "Send Reset Link" button

**Expected Results:**
- [ ] Page has email icon and clear heading
- [ ] Email input field is present
- [ ] "Send Reset Link" button is visible
- [ ] After clicking, loading spinner appears
- [ ] Success message appears: "Check Your Email"
- [ ] Shows the email address you entered
- [ ] "Back to Sign In" link is present

**Screenshot Location:** Take a screenshot of success state as `test-forgot-password-success.png`

---

### Test 2.3: Email Validation
**Steps:**
1. Go back to /auth/forgot-password
2. Try entering invalid email: "notanemail"
3. Click "Send Reset Link"

**Expected Results:**
- [ ] Browser validation prevents submission
- [ ] Or shows error message for invalid email

**Try empty email:**
1. Leave email field empty
2. Click "Send Reset Link"

**Expected Results:**
- [ ] Required field validation triggers
- [ ] Cannot submit with empty email

**Notes:** _______________________________________

---

### Test 2.4: Check Reset Email
**Steps:**
1. Open your email inbox (the one you used in Test 2.2)
2. Look for password reset email from Supabase
3. Check spam folder if not in inbox

**Expected Results:**
- [ ] Email received within 1-2 minutes
- [ ] Email contains reset link
- [ ] Link starts with your app URL
- [ ] Email looks professional

**Notes:** _______________________________________

---

### Test 2.5: Reset Password Page
**Steps:**
1. Click the reset link from the email
2. Observe the reset password page

**Expected Results:**
- [ ] Redirects to /auth/reset-password
- [ ] Page shows lock icon and "Reset Your Password" heading
- [ ] Two password input fields visible:
  - New Password
  - Confirm Password
- [ ] Password requirements are listed
- [ ] Eye icons to show/hide passwords
- [ ] "Reset Password" button visible

**Screenshot Location:** Take a screenshot as `test-reset-password-page.png`

---

### Test 2.6: Password Validation
**Test weak password:**
1. Enter "123" in new password field
2. Observe the requirements list

**Expected Results:**
- [ ] Requirements update in real-time
- [ ] Unmet requirements stay gray
- [ ] Met requirements turn green
- [ ] Cannot submit weak password

**Test non-matching passwords:**
1. Enter "StrongPass123" in new password
2. Enter "DifferentPass456" in confirm password
3. Click "Reset Password"

**Expected Results:**
- [ ] Error message: "Passwords do not match"
- [ ] Form does not submit

**Notes:** _______________________________________

---

### Test 2.7: Successful Password Reset
**Steps:**
1. Enter a strong password: "NewPass123!"
2. Enter the same password in confirm field
3. Click "Reset Password"
4. Observe what happens

**Expected Results:**
- [ ] Loading spinner appears
- [ ] Success message appears: "Password Reset Successful!"
- [ ] Shows "Redirecting to sign in..."
- [ ] Automatically redirects to /auth/signin after 2 seconds

**Screenshot Location:** Take a screenshot of success state as `test-reset-success.png`

---

### Test 2.8: Login with New Password
**Steps:**
1. On the sign-in page, enter your email
2. Enter the NEW password you just set
3. Click "Sign In"

**Expected Results:**
- [ ] Login is successful
- [ ] Redirects to appropriate dashboard
- [ ] No errors

**Notes:** _______________________________________

---

### Test 2.9: Expired Link
**Steps:**
1. Try using the same reset link again (from email)
2. Observe what happens

**Expected Results:**
- [ ] Shows error: "Invalid or expired reset link"
- [ ] Provides link to request new reset
- [ ] Cannot reset password with expired link

**Notes:** _______________________________________

---

## 🔍 Test 3: Global Search Functionality

### Test 3.1: Search from Header
**URL:** http://localhost:3000 (any page)

**Steps:**
1. Click on the search bar in the header
2. Type "developer"
3. Press Enter

**Expected Results:**
- [ ] Redirects to /search?q=developer
- [ ] Search results page loads
- [ ] Shows "Search Results" heading
- [ ] Shows "Found X results for 'developer'"

**Screenshot Location:** Take a screenshot as `test-search-results.png`

---

### Test 3.2: Search Results Display
**URL:** http://localhost:3000/search?q=react

**Steps:**
1. Navigate to the search page with query "react"
2. Observe the results

**Expected Results:**
- [ ] Search bar at top shows "react"
- [ ] Results count is displayed
- [ ] Tabs are visible: All, Gigs, Users, Skills
- [ ] Results are categorized by type
- [ ] Each result shows relevant information

**Gig Results Should Show:**
- [ ] Gig title
- [ ] Description preview
- [ ] Budget
- [ ] Application count
- [ ] Tags
- [ ] "View Details" button

**User Results Should Show:**
- [ ] User name/initials
- [ ] Role
- [ ] Bio (if available)
- [ ] Skills tags
- [ ] Clickable profile link

**Skill Results Should Show:**
- [ ] Skill name as clickable button
- [ ] Clean, organized layout

**Notes:** _______________________________________

---

### Test 3.3: Tab Filtering
**Steps:**
1. On the search results page, click "Gigs" tab
2. Observe results
3. Click "Users" tab
4. Observe results
5. Click "Skills" tab
6. Observe results
7. Click "All" tab

**Expected Results:**
- [ ] "Gigs" tab shows only gig results
- [ ] "Users" tab shows only user results
- [ ] "Skills" tab shows only skill results
- [ ] "All" tab shows all result types
- [ ] Active tab is highlighted in electric blue
- [ ] Result counts update correctly

**Notes:** _______________________________________

---

### Test 3.4: Empty Search Results
**Steps:**
1. Search for something unlikely: "xyzabc123notfound"
2. Observe the results page

**Expected Results:**
- [ ] Shows "No results found" message
- [ ] Shows search icon
- [ ] Suggests trying different terms
- [ ] Shows "Browse All Gigs" button
- [ ] No error messages

**Screenshot Location:** Take a screenshot as `test-search-empty.png`

---

### Test 3.5: Search with Special Characters
**Steps:**
1. Search for: "react & node.js"
2. Observe results

**Expected Results:**
- [ ] Search handles special characters
- [ ] No errors
- [ ] Results are relevant
- [ ] Special characters don't break the page

**Notes:** _______________________________________

---

### Test 3.6: Mobile Search
**Steps:**
1. Resize browser to mobile (375px)
2. Click search icon in header
3. Observe search overlay

**Expected Results:**
- [ ] Search overlay appears
- [ ] Search input is focused automatically
- [ ] Can type in search field
- [ ] Pressing Enter triggers search
- [ ] Overlay closes after search

**Screenshot Location:** Take a screenshot as `test-search-mobile.png`

---

### Test 3.7: Skill Tag Interaction
**Steps:**
1. Search for "javascript"
2. If skill results appear, click on a skill tag
3. Observe what happens

**Expected Results:**
- [ ] Clicking skill tag triggers new search
- [ ] URL updates with new query
- [ ] Results update to show that skill
- [ ] Smooth transition

**Notes:** _______________________________________

---

### Test 3.8: Search Performance
**Steps:**
1. Search for a common term: "web"
2. Note the time it takes to load results

**Expected Results:**
- [ ] Results load within 1-2 seconds
- [ ] Loading spinner shows while loading
- [ ] No lag or freezing
- [ ] Smooth user experience

**Performance Notes:** _______________________________________

---

## 🌐 Cross-Browser Testing

### Test on Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Styles render correctly

### Test on Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Styles render correctly

### Test on Safari (if available)
- [ ] All features work
- [ ] No console errors
- [ ] Styles render correctly

### Test on Edge
- [ ] All features work
- [ ] No console errors
- [ ] Styles render correctly

---

## 📱 Responsive Testing

### Mobile (375px width)
- [ ] Navigation works
- [ ] Search works
- [ ] Auth pages are readable
- [ ] Buttons are touch-friendly
- [ ] No horizontal scroll

### Tablet (768px width)
- [ ] Navigation adapts
- [ ] Search works
- [ ] Layout is appropriate
- [ ] Touch targets are adequate

### Desktop (1920px width)
- [ ] Full navigation visible
- [ ] Breadcrumbs show
- [ ] Search bar in header
- [ ] Optimal layout

---

## 🐛 Bug Tracking

### Bugs Found

**Bug #1:**
- **Feature:** _______________________
- **Description:** _______________________
- **Steps to Reproduce:** _______________________
- **Expected:** _______________________
- **Actual:** _______________________
- **Severity:** High / Medium / Low
- **Screenshot:** _______________________

**Bug #2:**
- **Feature:** _______________________
- **Description:** _______________________
- **Steps to Reproduce:** _______________________
- **Expected:** _______________________
- **Actual:** _______________________
- **Severity:** High / Medium / Low
- **Screenshot:** _______________________

**Bug #3:**
- **Feature:** _______________________
- **Description:** _______________________
- **Steps to Reproduce:** _______________________
- **Expected:** _______________________
- **Actual:** _______________________
- **Severity:** High / Medium / Low
- **Screenshot:** _______________________

---

## ✅ Test Summary

### Enhanced Navigation
- **Tests Passed:** _____ / 6
- **Tests Failed:** _____
- **Status:** Pass / Fail / Partial

### Forgot Password
- **Tests Passed:** _____ / 9
- **Tests Failed:** _____
- **Status:** Pass / Fail / Partial

### Global Search
- **Tests Passed:** _____ / 8
- **Tests Failed:** _____
- **Status:** Pass / Fail / Partial

### Overall
- **Total Tests:** 23
- **Passed:** _____
- **Failed:** _____
- **Success Rate:** _____%

---

## 📝 Notes & Observations

### What Worked Well:
_______________________________________
_______________________________________
_______________________________________

### Issues Found:
_______________________________________
_______________________________________
_______________________________________

### Suggestions for Improvement:
_______________________________________
_______________________________________
_______________________________________

---

## 🎯 Next Steps

Based on test results:

1. **If all tests pass:**
   - [ ] Document any minor issues
   - [ ] Prepare for production deployment
   - [ ] Create user documentation

2. **If tests fail:**
   - [ ] Document all bugs found
   - [ ] Prioritize fixes (High → Medium → Low)
   - [ ] Fix critical bugs first
   - [ ] Retest after fixes

3. **User Acceptance Testing:**
   - [ ] Get 3-5 users to test
   - [ ] Collect feedback
   - [ ] Iterate based on feedback

---

**Tester Name:** _______________________  
**Date Completed:** _______________________  
**Time Taken:** _______________________  
**Overall Assessment:** _______________________

---

*Save this document with your test results for future reference*
