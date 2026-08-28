import { redirect } from"next/navigation"

export default function InternshipsIndexRedirect() {
 // Redirect to a default city or generic listing so it doesn't 404
 redirect("/internships/bangalore")
}

export const metadata = {
 robots: { index: false },
}
