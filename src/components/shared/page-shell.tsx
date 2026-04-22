import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageShellProps = {
  title: string;
  description: string;
};

export function PageShell({ title, description }: PageShellProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
      </CardContent>
    </Card>
  );
}
