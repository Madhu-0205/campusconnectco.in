import {  ShieldAlert, LifeBuoy } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Contact Us | CampusConnect",
  description: "Get in touch with the CampusConnect team for support, legal inquiries, or partnership opportunities.",
  alternates: {
    canonical: "https://campusconnectco.in/contact",
  },
  openGraph: {
    title: "Contact Us | CampusConnect",
    description: "Get in touch with the CampusConnect team for support, legal inquiries, or partnership opportunities.",
    url: "https://campusconnectco.in/contact",
    siteName: "CampusConnect",
    locale: "en_IN",
    type: "website",
  }
};

const sections = [
  { id: "support", title: "1. General Support" },
  { id: "legal", title: "2. Legal & Privacy" },
  { id: "trust", title: "3. Trust & Safety" },
];

export default function ContactPage() {
  return (
    <LegalLayout
      title="Contact Us"
      lastUpdated="August 1, 2026"
      sections={sections}
    >
      <div className="mb-12">
        <p className="text-xl">
          We&apos;re here to help! Whether you&apos;re a student facing an issue, a startup looking to partner, or someone with a legal inquiry, you can reach the right team below.
        </p>
      </div>

      <section id="support">
        <div className="flex items-center gap-4 mt-16 mb-6">
          <div className="w-12 h-12 rounded-xl bg-(--primary)/20 flex items-center justify-center text-(--primary-light)">
            <LifeBuoy size={24} />
          </div>
          <h2 className="mt-0 mb-0">1. General Support</h2>
        </div>
        <p>
          For general inquiries, account issues, bug reports, or feature requests, please reach out to our support team. We aim to respond to all support requests within 24-48 hours.
        </p>
        <div className="bg-(--surface-2) border border-(--border) rounded-2xl p-6 mt-4">
          <p className="m-0 font-bold text-white text-lg">support@campusconnectco.in</p>
        </div>
      </section>

      <section id="legal">
        <div className="flex items-center gap-4 mt-16 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
            <ShieldAlert size={24} />
          </div>
          <h2 className="mt-0 mb-0">2. Legal & Privacy</h2>
        </div>
        <p>
          If you have questions regarding our <Link href="/terms">Terms & Conditions</Link>, <Link href="/privacy">Privacy Policy</Link>, or need to exercise your data rights (e.g., account deletion, data access), contact our legal and privacy team.
        </p>
        <div className="bg-(--surface-2) border border-(--border) rounded-2xl p-6 mt-4">
          <p className="m-0 font-bold text-white text-lg">legal@campusconnectco.in</p>
        </div>
      </section>

      <section id="trust">
        <div className="flex items-center gap-4 mt-16 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#F43F5E]/20 flex items-center justify-center text-[#F43F5E]">
            <ShieldAlert size={24} />
          </div>
          <h2 className="mt-0 mb-0">3. Trust & Safety</h2>
        </div>
        <p>
          We take the safety of our community very seriously. If you encounter a fake job listing, a scam, harassment, or any violation of our <Link href="/community-guidelines">Community Guidelines</Link>, report it immediately.
        </p>
        <div className="bg-(--surface-2) border border-(--border) rounded-2xl p-6 mt-4">
          <p className="m-0 font-bold text-white text-lg">trust@campusconnectco.in</p>
        </div>
      </section>
    </LegalLayout>
  );
}
