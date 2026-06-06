type StatusMessageProps = {
  tone: "error" | "success" | "info";
  message: string;
};

const toneClasses = {
  error: "border-[#3D4550] bg-[#152543] text-[#F8F6F1]",
  success: "border-[#2DBFA6] bg-[#2DBFA6]/10 text-[#F8F6F1]",
  info: "border-[#E8A03D] bg-[#E8A03D]/10 text-[#F8F6F1]",
} as const;

export function StatusMessage({ tone, message }: StatusMessageProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`rounded-md border px-3 py-2 text-sm ${toneClasses[tone]}`}
    >
      {message}
    </p>
  );
}
