import { auth } from "@/lib/auth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: any) => {
    console.log("Middleware hitting path:", req.nextUrl.pathname)
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")

    if (isOnDashboard && !isLoggedIn) {
        console.log("Redirecting to auth/signin")
        return Response.redirect(new URL("/auth/signin", req.nextUrl))
    }
    console.log("Middleware passed")
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
