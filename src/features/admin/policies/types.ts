export type PolicyStatus = "active" | "draft" | "inactive";

export type Policy = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PolicyStatus;
};
