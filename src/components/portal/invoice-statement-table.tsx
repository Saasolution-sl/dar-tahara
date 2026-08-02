import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PortalCard, StatusBadge } from "@/components/portal/portal-shell";

export type InvoiceStatementTableRow = {
  key: string;
  month: string;
  amount: string;
  status: string;
  statusNote?: string;
  date: string;
  due: string;
  reference: string;
  downloadHref?: string;
  paymentHref?: string;
};

type Props = {
  title: string;
  emptyMessage: string;
  rows: InvoiceStatementTableRow[];
  labels: {
    month: string;
    amount: string;
    status: string;
    date: string;
    due: string;
    reference: string;
    download: string;
    payNow: string;
  };
};

export function InvoiceStatementTable({ title, emptyMessage, rows, labels }: Props) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl">{title}</h2>
      {!rows.length ? (
        <div className="mt-4">
          <PortalCard title={title}>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </PortalCard>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[800px] table-fixed text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-[16%] p-4">{labels.month}</th>
                <th className="w-[15%] p-4">{labels.amount}</th>
                <th className="w-[17%] p-4">{labels.status}</th>
                <th className="w-[14%] p-4">{labels.date}</th>
                <th className="w-[14%] p-4">{labels.due}</th>
                <th className="w-[13%] p-4">{labels.reference}</th>
                <th className="w-[11%] p-4" aria-label={labels.download} />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.key} className="align-top">
                  <td className="p-4 font-medium capitalize">{row.month}</td>
                  <td className="p-4 font-semibold tabular-nums">{row.amount}</td>
                  <td className="p-4">
                    <StatusBadge value={row.status} />
                    {row.statusNote ? (
                      <div className="mt-1.5 text-xs leading-4 text-muted-foreground">{row.statusNote}</div>
                    ) : null}
                  </td>
                  <td className="p-4 whitespace-nowrap">{row.date}</td>
                  <td className="p-4 whitespace-nowrap">{row.due}</td>
                  <td className="p-4 font-medium tabular-nums">{row.reference}</td>
                  <td className="p-4">
                    <div className="flex flex-col items-stretch gap-2">
                      {row.paymentHref ? (
                        <Link href={row.paymentHref} className={buttonVariants({ variant: "primary", size: "sm" })}>
                          {labels.payNow}
                        </Link>
                      ) : null}
                      {row.downloadHref ? (
                        <Link href={row.downloadHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          {labels.download}
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
