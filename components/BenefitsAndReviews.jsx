'use client';

import React from 'react';
import { Check, Star, ShieldCheck } from 'lucide-react';

export default function BenefitsAndReviews() {
  const benefits = [
    {
      title: 'Naturally Sweet',
      description: 'A wholesome, natural sweetness with zero added sugar or artificial syrups.',
    },
    {
      title: 'Everyday Snack',
      description: 'Convenient, portable and satisfying energy boost any time of the day.',
    },
    {
      title: 'Source of Dietary Fiber',
      description: 'Raisins naturally contain dietary fiber supporting healthy everyday digestion.',
    },
    {
      title: 'Naturally Occurring Nutrients',
      description: 'Simple, unadulterated food the way nature intended, packed with antioxidants.',
    },
  ];

  const reviews = [
    {
      name: 'Ananya Sharma',
      initial: 'A',
      rating: 5,
      text: 'The golden raisins are so plump and fresh! Genuinely the best I have bought online. Packaging felt premium too.',
    },
    {
      name: 'Rahul Mehta',
      initial: 'R',
      rating: 5,
      text: 'Ordered the California almonds and cashews for gifting. Everyone loved them. Quality is top-notch.',
    },
    {
      name: 'Priya Nair',
      initial: 'P',
      rating: 4.5,
      text: 'Lovely natural sweetness, not overly dry. Delivery was quick and the pouch reseals nicely.',
    },
    {
      name: 'Vikram Singh',
      initial: 'V',
      rating: 5,
      text: 'Golden raisins taste wonderfully fresh and sweet, exactly what you look for. Will reorder for sure.',
    },
    {
      name: 'Sneha Iyer',
      initial: 'S',
      rating: 5,
      text: 'Clean, hygienic and clearly premium. The jumbo raisins are huge and juicy!',
    },
    {
      name: 'Arjun Kapoor',
      initial: 'A',
      rating: 4.5,
      text: 'Great everyday snack for the whole family. Fair pricing for the quality you get.',
    },
  ];

  return (
    <>
      {/* Product Benefits Section */}
      <section className="container py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Images Grid */}
          <div className="rn-fade-up grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-2xl shadow-md aspect-square">
              <img
                src="https://images.unsplash.com/photo-1590785069874-a283f2c8d420?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
                alt="Natural Raisins"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
            <div className="overflow-hidden rounded-2xl shadow-md aspect-square mt-8">
              <img
                src="https://images.unsplash.com/photo-1641291361624-38b69b86b1cf?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
                alt="Mixed Dry Fruits"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
          </div>

          {/* Benefits List */}
          <div className="rn-fade-up">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
              Product Benefits
            </span>
            <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A]">
              Simple, Wholesome, Real
            </h2>
            <p className="mt-3 text-[#6B4432]">
              Enjoy the natural goodness of raisins and nuts as part of a balanced everyday diet.
            </p>

            <div className="mt-8 space-y-5">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-[#173B2A]/10 text-[#173B2A] flex items-center justify-center mt-0.5">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#173B2A] text-base">
                      {b.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B4432] mt-0.5">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section id="reviews" className="bg-[#EFE6D2] py-16 sm:py-20 scroll-mt-20">
        <div className="container">
          <div className="rn-fade-up text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C49A4A] font-bold">
              Customer Reviews
            </span>
            <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-bold text-[#173B2A]">
              Loved Across India
            </h2>
            <p className="mt-3 text-[#6B4432]">
              Real feedback from real households who choose purity every day.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="rn-fade-up bg-white rounded-2xl border border-[#173B2A]/8 p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < Math.floor(rev.rating)
                            ? 'fill-[#C49A4A] text-[#C49A4A]'
                            : 'text-[#C49A4A]/30'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-3.5 text-xs sm:text-sm text-[#6B4432] leading-relaxed italic">
                    “{rev.text}”
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-[#173B2A]/5">
                  <div className="h-9 w-9 rounded-full bg-[#173B2A] text-[#F7F1E5] flex items-center justify-center font-bold text-sm">
                    {rev.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#173B2A]">
                      {rev.name}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#173B2A]/70 font-medium">
                      <ShieldCheck className="w-3 h-3 text-[#C49A4A]" />
                      Verified Purchase
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
