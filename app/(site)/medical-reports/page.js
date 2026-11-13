import MedicalReportAccess from "@/components/MedicalReportAccess";
import { getLang } from "@/lib/i18n";

export const metadata = {
  title: "Patient medical reports | Independent prototype",
  description: "Secure demonstration access to private medical reports.",
  robots: { index: false, follow: false },
};

export default async function MedicalReportsPage() {
  const lang = await getLang();
  return <MedicalReportAccess lang={lang} />;
}
