export type SeoStatus = "active" | "draft";

export type SeoEntry = {
  id: string;
  pageKey: string;
  title: string;
  description: string;
  canonicalUrl: string;
  status: SeoStatus;
};
