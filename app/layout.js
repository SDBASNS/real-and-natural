import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Real & Natural — Premium Natural Raisins & Dry Fruits',
  description:
    'Premium quality raisins and dry fruits, carefully selected for natural sweetness, freshness and everyday goodness. Hygienically packed and delivered across India.',
  keywords: 'raisins, kishmish, dry fruits, natural, premium, India, almonds, cashews',
  openGraph: {
    title: 'Real & Natural — Premium Natural Raisins & Dry Fruits',
    description:
      'Nature’s sweetness, delivered pure. Premium natural raisins & dry fruits, hygienically packed and delivered across India.',
    siteName: 'Real & Natural',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1642102903918-b97c37955bbf?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
        width: 1200,
        height: 630,
        alt: 'Real & Natural Raisins',
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Real & Natural',
              description:
                'Premium natural raisins and dry fruits, hygienically packed and delivered across India.',
              url: 'https://real-and-natural.example.com',
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-[#F7F1E5] text-[#173B2A] flex flex-col">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
