"use client";

import React from "react";

import { Spinner } from "@/components/v2/Spinner";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
      <Spinner size="lg" />
    </div>
  );
}
