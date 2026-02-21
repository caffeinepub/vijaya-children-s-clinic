import { Heart } from 'lucide-react';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'vijaya-clinic'
  );

  return (
    <footer className="border-t bg-card/95 backdrop-blur mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-3 text-primary">Vijaya Children's Clinic</h3>
            <p className="text-sm text-foreground mb-2 font-medium">
              Dr. K. Manicka Vinayagar M.B.B.S, M.D
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Consultant Paediatrician - New Born and Child Specialist
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Reg.No: 152853
            </p>
            <p className="text-sm text-secondary font-medium">
              குழந்தை நலனே எங்கள் முதன்மை
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 text-primary">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="tel:9363716343" className="hover:text-primary transition-colors font-medium">
                  📞 93637 16343
                </a>
              </li>
              <li>
                <strong>Timings:</strong> Mon to Sat | 7 PM to 9 PM
              </li>
              <li className="text-xs">Sundays on appointment</li>
              <li>
                No.1, 1st street, Balaji Nagar,<br />
                Anakaputhur, Chennai - 600 070
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 text-primary">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Newborn Care</li>
              <li>• Vaccination</li>
              <li>• Fever</li>
              <li>• Nebulization</li>
              <li>• Growth Monitoring</li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Vijaya Children's Clinic. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-4 h-4 text-destructive fill-destructive" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
