'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

type Review = {
  id: string
  author: string
  rating: number
  date: string
  title: string
  body: string
  verified: boolean
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Ahmed M.',
    rating: 5,
    date: '2026-09-02',
    title: 'Excellent build quality',
    body: 'Exactly what I needed for my studio work. Sharp, reliable and well worth the price.',
    verified: true,
  },
  {
    id: 'r2',
    author: 'Sara K.',
    rating: 4,
    date: '2026-08-18',
    title: 'Great value',
    body: 'Very happy with this purchase. Delivery was fast and the product matches the description perfectly.',
    verified: true,
  },
  {
    id: 'r3',
    author: 'Omar T.',
    rating: 5,
    date: '2026-07-25',
    title: 'Professional grade',
    body: 'I use this daily and it has held up flawlessly. Highly recommend for serious creators.',
    verified: false,
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`size-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
      ))}
    </div>
  )
}

export function ReviewsSection({ productName }: { productName: string }) {
  const [reviews] = useState<Review[]>(MOCK_REVIEWS)
  const [showForm, setShowForm] = useState(false)
  const [formRating, setFormRating] = useState(5)
  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formName, setFormName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setShowForm(false)
  }

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-2xl font-semibold">Customer reviews</h2>

      <div className="mt-6 flex flex-wrap items-center gap-6">
        <div className="text-center">
          <p className="text-4xl font-semibold">{avgRating}</p>
          <Stars rating={Math.round(Number(avgRating))} />
          <p className="mt-1 text-xs text-muted-foreground">{reviews.length} reviews</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length
            const pct = reviews.length ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-right">{star} ★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-muted-foreground">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {!submitted && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-6 min-h-10 rounded-(--radius-control) border border-brand px-5 text-sm font-semibold text-brand-ink hover:bg-brand-muted"
        >
          Write a review
        </button>
      )}

      {submitted && (
        <p className="mt-6 rounded-(--radius-control) bg-green-50 p-3 text-sm text-green-700">
          Thank you for your review! It will appear after moderation.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmitReview} className="mt-4 space-y-3 rounded-(--radius-card) border bg-card p-5">
          <div>
            <label className="block text-sm font-medium">Your rating</label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" onClick={() => setFormRating(i)} aria-label={`${i} stars`}>
                  <Star className={`size-6 ${i <= formRating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Your name</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Ahmed M." className="mt-1 min-h-10 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Review title</label>
            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1 min-h-10 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Your review</label>
            <textarea value={formBody} onChange={(e) => setFormBody(e.target.value)} rows={3} className="mt-1 w-full rounded-(--radius-control) border bg-background px-3 py-2 text-sm" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="min-h-10 rounded-(--radius-control) bg-brand px-5 text-sm font-semibold text-brand-foreground">
              Submit review
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="min-h-10 rounded-(--radius-control) border px-5 text-sm font-medium">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 divide-y divide-border">
        {reviews.map((review) => (
          <article key={review.id} className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <Stars rating={review.rating} />
              <span className="text-sm font-semibold">{review.title}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.body}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{review.author}</span>
              <span>·</span>
              <time dateTime={review.date}>{new Date(review.date).toLocaleDateString('en-EG')}</time>
              {review.verified && (
                <>
                  <span>·</span>
                  <span className="font-medium text-green-700">Verified purchase</span>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
