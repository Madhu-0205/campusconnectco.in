"use client";

import { Suspense } from"react";

import NetworkClient from"./NetworkClient";

export default function Page(props: any) {
 return (
 <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading network...</div>}>
 <NetworkClient {...props} />
 </Suspense>
 );
}
