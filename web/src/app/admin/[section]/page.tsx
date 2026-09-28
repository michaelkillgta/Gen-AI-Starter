import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/DataTable";
import { loadAdmin } from "@/features/admin/server";
import { isTableKey, rowsOf, tableDef } from "@/features/admin/tables";

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ open?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  return { title: isTableKey(section) ? tableDef(section).title : "Not found" };
}

/** /admin/waitlist, /admin/suggestions, /admin/subscribers, /admin/contacts. */
export default async function AdminSection({ params, searchParams }: Props) {
  const { section } = await params;
  if (!isTableKey(section)) notFound();
  const load = await loadAdmin();
  if (load.kind !== "ok") return <AdminNotice kind={load.kind} />;
  const { open } = await searchParams;

  return (
    <AdminShell current={section} data={load.data}>
      <DataTable table={section} rows={rowsOf(load.data, section)} openId={open ?? null} />
    </AdminShell>
  );
}
