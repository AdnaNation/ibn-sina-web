import MedicalReportAccess from "@/components/MedicalReportAccess";

export const metadata = {
  title: "Patient medical reports | Independent prototype",
  description: "Secure demonstration access to private medical reports.",
  robots: { index: false, follow: false },
};

export default function MedicalReportsPage() {
  return <MedicalReportAccess />;
}
