type StatusMessageProps = {
  tone: "error" | "success" | "info";
  message: string;
};

const toneClasses = {
  error: "auth-status-error",
  success: "auth-status-success",
  info: "auth-status-info",
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
