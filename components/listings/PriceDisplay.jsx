export const peso = (n) => `₱${Number(n).toLocaleString("en-PH")}`;

// Monthly rent plus any extra monthly fees the owner listed, so renters see the real monthly cost.
export default function PriceDisplay({ rent, otherFees }) {
  return (
    <div>
      <p className="text-lg font-bold text-ink">
        {peso(rent)} <span className="text-sm font-normal text-muted">/ month</span>
      </p>
      {Number(otherFees) > 0 && <p className="text-xs text-muted">+ {peso(otherFees)} other fees / month</p>}
    </div>
  );
}