import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { PythonCourse } from "@/components/python/PythonCourse";

export const metadata: Metadata = {
  title: "Python",
  description:
    "The Python you need to read and write AI agent code: 46 short lessons in 7 parts, with interactive labs and full notes.",
};

export default function PythonPage() {
  return (
    <>
      <PythonCourse />
      <SiteFooter variant="full" />
    </>
  );
}
