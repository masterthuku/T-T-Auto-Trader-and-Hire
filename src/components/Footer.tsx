// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">T T Auto Trader & Hire</h3>
            <p className="text-gray-400">
              Reliable vehicle hire services in Nairobi and beyond.
            </p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms-and-conditions" className="text-gray-400 hover:text-white font-medium">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p className="text-gray-400">Nairobi, Kenya</p>
            <p className="text-gray-400 mt-2">Phone: +254723035198</p>
            <p className="text-gray-400">Email: info@ttautotrader.co.ke</p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} T T Auto Trader and Hire. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}