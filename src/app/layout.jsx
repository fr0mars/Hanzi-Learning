import './globals.css';

export const metadata = {
  title: 'Hanzi Learning',
  description: 'Apprentissage HSK Fullstack',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
