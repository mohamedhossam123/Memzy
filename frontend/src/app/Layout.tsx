import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>{/* Navbar goes here later */}</header>
        <main>{children}</main> {/* Pages inject here */}
        <footer>{/* Footer goes here later */}</footer>
      </body>
    </html>
  );
}
