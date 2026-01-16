// app/terms-and-conditions/page.tsx

import TermsAndConditions from "@/components/TermsAndConditions";


export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        <TermsAndConditions />
      </div>
    </div>
  );
}