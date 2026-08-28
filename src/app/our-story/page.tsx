import { redirect } from"next/navigation"

// /our-story is an alias for /about.
// Permanent redirect so existing inbound links (social, docs) resolve correctly.
export default function OurStoryRedirect() {
 redirect("/about")
}

export const metadata = {
 robots: { index: false },
}
