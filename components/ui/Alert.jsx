// Status is shown with a text label as well as color (documentation section 5.2).
export default function Alert({ variant = "error", children }) {
  const isSuccess = variant === "success";
  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`rounded-lg border px-3 py-2 text-sm ${
        isSuccess ? "border-success/30 bg-primary-light text-success" : "border-error/30 bg-error/10 text-error"
      }`}
    >
      <span className="font-semibold">{isSuccess ? "Success:" : "Error:"}</span> {children}
    </div>
  );
}