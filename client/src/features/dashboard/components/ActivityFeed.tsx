import { useTransactions } from '../hooks/useTransactions'
import s from './ActivityFeed.module.css'
import type { Transaction } from '@/types'

const CATEGORY_EMOJI: Record<string, string> = {
  Coffee: '☕',
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Subscriptions: '📱',
  Groceries: '🛒',
  Gas: '⛽',
  Health: '💊',
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function TransactionItem({ tx, index }: { tx: Transaction; index: number }) {
  const emoji = CATEGORY_EMOJI[tx.category] ?? '💳'
  const hasRoundUp = tx.roundUp && tx.roundUp.amount > 0

  return (
    <div className={s.item} style={{ animationDelay: `${index * 50}ms` }}>
      <div className={s.iconWrap}>
        <span className={s.emoji} aria-hidden>{emoji}</span>
      </div>
      <div className={s.body}>
        <div className={s.topRow}>
          <span className={s.merchant}>{tx.merchant}</span>
          <span className={s.time}>{relativeTime(tx.date)}</span>
        </div>
        <div className={s.bottomRow}>
          <span className={s.spent}>${tx.amount.toFixed(2)} spent</span>
          {hasRoundUp && (
            <span className={s.roundup}>
              {' '}→ <span className={s.roundupAmount}>+${tx.roundUp!.amount.toFixed(2)} saved</span> ✨
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface ActivityFeedProps {
  limit?: number
}

export function ActivityFeed({ limit = 10 }: ActivityFeedProps) {
  const { data, isLoading } = useTransactions(limit)
  const transactions = data?.pages[0]?.transactions ?? []

  if (isLoading) {
    return (
      <div className={s.feed}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={s.skeleton} />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return <p className={s.empty}>No recent activity yet.</p>
  }

  return (
    <div className={s.feed}>
      {transactions.map((tx, i) => (
        <TransactionItem key={tx.id} tx={tx} index={i} />
      ))}
    </div>
  )
}
