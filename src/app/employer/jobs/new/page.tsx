import type { Metadata } from "next";
import { PostShiftScreen } from "@/features/job-posting";

export const metadata: Metadata = { title: "Post a shift" };

export default async function NewJobPage({ searchParams }: PageProps<"/employer/jobs/new">) {
  const { from } = await searchParams;
  return <PostShiftScreen from={typeof from === "string" && from ? from : undefined} />;
}
