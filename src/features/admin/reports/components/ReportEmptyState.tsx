import { EmptyState } from "@/components/admin/shared/EmptyState";

export function ReportEmptyState({ title, description }: { title: string; description: string }) {
  return <EmptyState title={title} description={description} />;
}
