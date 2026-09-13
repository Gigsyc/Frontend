import { RoleIcon } from "@/components/common/role-icon";
import { ROLES, SECTORS } from "@/data/roles";
import { formatRwf, shiftHours } from "@/lib/utils";
import type { RoleCategory } from "@/types";
import { Section, SectionIntro } from "../section";

const SHOWN: RoleCategory[] = ["waiter", "bartender", "registration", "host", "usher", "promoter"];
/** A representative shift for the "per hour" hint. */
const TYPICAL_SHIFT = { start: "16:00", end: "23:30", breakMinutes: 30 };

/** Typical pay per shift from the role catalogue. A table, because people compare. */
export function PayTable() {
  const hours = shiftHours(TYPICAL_SHIFT.start, TYPICAL_SHIFT.end, TYPICAL_SHIFT.breakMinutes);
  return (
    <Section id="pay" tone="canvas">
      <SectionIntro
        eyebrow="What you earn"
        title="Flat pay per shift, agreed before you accept"
        lede="Every shift lists a fixed amount, hours, whether a meal is provided and any transport allowance. These are the typical ranges employers post for the six most common roles."
      />
      <div className="mt-10 overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border bg-canvas text-left text-xs font-semibold uppercase tracking-wider text-fg-muted">
              <th scope="col" className="px-4 py-3 sm:px-5">Role</th>
              <th scope="col" className="px-4 py-3 sm:px-5">Sector</th>
              <th scope="col" className="px-4 py-3 text-right sm:px-5">Typical pay per shift</th>
              <th scope="col" className="hidden px-4 py-3 text-right sm:px-5 md:table-cell">On a {hours}h evening</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {SHOWN.map((key) => {
              const r = ROLES[key];
              const [lo, hi] = r.typicalPay;
              return (
                <tr key={key}>
                  <th scope="row" className="px-4 py-3 text-left font-normal sm:px-5">
                    <span className="flex items-center gap-3">
                      <RoleIcon role={key} size="sm" />
                      <span>
                        <span className="block font-semibold text-fg">{r.label}</span>
                        <span className="block text-xs text-fg-muted">{r.description}</span>
                      </span>
                    </span>
                  </th>
                  <td className="px-4 py-3 text-fg-muted sm:px-5">{SECTORS[r.sector].label}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular text-navy-900 sm:px-5">{formatRwf(lo)} – {formatRwf(hi)}</td>
                  <td className="hidden px-4 py-3 text-right tabular text-fg-muted sm:px-5 md:table-cell">
                    {formatRwf(Math.round(lo / hours / 100) * 100)} – {formatRwf(Math.round(hi / hours / 100) * 100)} / h
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-fg-subtle">Ranges reflect shifts posted on the prototype. Transport allowances and meals are listed separately on each shift.</p>
    </Section>
  );
}
