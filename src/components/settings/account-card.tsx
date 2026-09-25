import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountCard({ email, role }: { email: string; role: "creator" | "brand" }) {
  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <dl className="grid max-w-md grid-cols-[6rem_1fr] gap-y-3 text-sm">
        <dt className="text-foreground-muted">Email</dt>
        <dd className="truncate">{email}</dd>
        <dt className="text-foreground-muted">Account type</dt>
        <dd className="capitalize">{role}</dd>
      </dl>
    </Card>
  );
}
