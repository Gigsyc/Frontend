import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  { title: "Workers are paid first", body: "Once you approve a completed shift, each worker's pay goes to their MTN MoMo within 24 hours. You never handle cash." },
  { title: "One invoice a fortnight", body: "Every two weeks we total the worker pay on your completed shifts and add an 18% service fee for matching, verification and cover." },
  { title: "14 days to settle", body: "Pay by MoMo Business or bank transfer. If an invoice goes overdue, new postings pause until it's cleared." },
];

export function BillingExplainer() {
  return (
    <Card>
      <CardHeader><CardTitle>How billing works</CardTitle></CardHeader>
      <CardContent className="pt-4">
        <ol className="flex flex-col gap-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white tabular">{i + 1}</span>
              <span className="text-sm">
                <span className="block font-medium text-fg">{s.title}</span>
                <span className="mt-0.5 block leading-5 text-fg-muted">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
