import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type EnquiryPrefill = {
  subject: string;
  message: string;
  type: string;
};

type EnquiryContextValue = {
  prefill: EnquiryPrefill | null;
  requestEnquiry: (subject: string, message?: string, type?: string) => void;
};

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [prefill, setPrefill] = useState<EnquiryPrefill | null>(null);

  const value = useMemo<EnquiryContextValue>(
    () => ({
      prefill,
      requestEnquiry: (subject, message, type = "Full home interior") => {
        setPrefill({
          subject,
          message: message ?? `I'd like to enquire about ${subject}.`,
          type,
        });
        window.setTimeout(() => {
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      },
    }),
    [prefill],
  );

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export function useEnquiry() {
  const context = useContext(EnquiryContext);
  if (!context) throw new Error("useEnquiry must be used inside EnquiryProvider");
  return context;
}
