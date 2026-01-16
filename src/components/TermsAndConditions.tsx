// components/TermsAndConditions.tsx
export default function TermsAndConditions() {
  return (
    <div className="p-8 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
        Vehicle Hire Terms and Conditions
      </h1>
      
      <p className="text-center text-gray-600 mb-10">
        <strong>Effective Date: January 11, 2025</strong>
      </p>

      <div className="prose prose-lg max-w-none text-gray-700">
        <p>
          These Terms and Conditions govern the rental of vehicles from <strong>T T Auto Trader and Hire</strong> 
          (“Company”, “we”, “us”, or “our”) to the renter (“Renter”, “you”, or “your”). 
          By signing the Rental Agreement or collecting the vehicle, you agree to be bound by these Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">1. Definitions</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Vehicle</strong> – The motor vehicle described in the Rental Agreement, including all accessories.</li>
          <li><strong>Rental Period</strong> – From collection until return to the Company.</li>
          <li><strong>Renter</strong> – Person(s) named in the Rental Agreement authorized to drive.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">3. Rental Charges & Conditions</h2>
        <p>You agree to pay:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Daily/weekly rental rate as stated</li>
          <li>Fuel charges (return with same fuel level or refueling fee applies)</li>
          <li>Insurance excess/damage waiver fees (if selected)</li>
          <li>
            <strong>Late return fees</strong>: KSh <strong>500 per hour</strong> after a <strong>1-hour grace period</strong> from the agreed return time
          </li>
          <li>Cleaning fee (if returned excessively dirty)</li>
          <li>Traffic violation fines + KSh 2,000 administration fee per violation</li>
        </ul>
        <p className="mt-4">All rates subject to 16% VAT unless stated otherwise.</p>
        <p>
            Hirer shall be at least 21 years of age, and must produce evidence of 3 years drivers experience, and current and valid licence for both the hirer and the alternative driver.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">7. Return of Vehicle</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Return on agreed date/time and in same condition (normal wear excepted)</li>
          <li>
            <strong>Late return</strong>: KSh <strong>500 per hour</strong> after <strong>1-hour grace period</strong>
          </li>
          <li>Return with same fuel level or refueling charges apply</li>
          <li>Keys and accessories must be returned</li>
        </ul>

        {/* Add the rest of your terms here - copy from previous message */}
        {/* ... Sections 1–13 ... */}

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>T T Auto Trader and Hire</p>
          <p>Nairobi, Kenya</p>
          <p>Effective: January 11, 2025</p>
        </div>
      </div>
    </div>
  );
}