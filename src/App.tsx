import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Flame, Target, BarChart2, X } from 'lucide-react'

const ACCENT = '#E05C2A'

interface FoodEntry {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
}

interface DayLog {
  date: string
  entries: FoodEntry[]
  goal: number
}

const COMMON_FOODS = [
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Rice (100g cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Egg', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Whole Milk (200ml)', calories: 130, protein: 6.6, carbs: 9.6, fat: 7.2 },
  { name: 'Bread Slice', calories: 79, protein: 3, carbs: 15, fat: 1 },
  { name: 'Almonds (30g)', calories: 173, protein: 6, carbs: 6, fat: 15 },
  { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Oats (50g)', calories: 188, protein: 6.5, carbs: 32, fat: 3.5 },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function timeStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function App() {
  const [logs, setLogs] = useState<Record<string, DayLog>>(() => {
    try { return JSON.parse(localStorage.getItem('calorie_logs') || '{}') } catch { return {} }
  })
  const [goal, setGoal] = useState<number>(() => parseInt(localStorage.getItem('calorie_goal') || '2000'))
  const [tab, setTab] = useState<'today' | 'history' | 'stats'>('today')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' })
  const [showGoal, setShowGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(String(goal))
  const [expandDay, setExpandDay] = useState<string | null>(null)

  const today = todayStr()

  useEffect(() => {
    localStorage.setItem('calorie_logs', JSON.stringify(logs))
  }, [logs])

  useEffect(() => {
    localStorage.setItem('calorie_goal', String(goal))
  }, [goal])

  function todayLog(): DayLog {
    return logs[today] || { date: today, entries: [], goal }
  }

  function addEntry() {
    const cal = parseInt(form.calories) || 0
    if (!form.name.trim() || cal <= 0) return
    const entry: FoodEntry = {
      id: Date.now().toString(),
      name: form.name.trim(),
      calories: cal,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
      time: timeStr(),
    }
    const log = todayLog()
    setLogs(prev => ({ ...prev, [today]: { ...log, entries: [...log.entries, entry], goal } }))
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '' })
    setShowAdd(false)
  }

  function deleteEntry(id: string) {
    const log = todayLog()
    setLogs(prev => ({ ...prev, [today]: { ...log, entries: log.entries.filter(e => e.id !== id) } }))
  }

  function quickAdd(food: typeof COMMON_FOODS[0]) {
    const entry: FoodEntry = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      time: timeStr(),
    }
    const log = todayLog()
    setLogs(prev => ({ ...prev, [today]: { ...log, entries: [...log.entries, entry], goal } }))
    setShowAdd(false)
  }

  const log = todayLog()
  const totalCal = log.entries.reduce((s, e) => s + e.calories, 0)
  const totalProtein = log.entries.reduce((s, e) => s + e.protein, 0)
  const totalCarbs = log.entries.reduce((s, e) => s + e.carbs, 0)
  const totalFat = log.entries.reduce((s, e) => s + e.fat, 0)
  const pct = Math.min(100, Math.round((totalCal / goal) * 100))
  const remaining = goal - totalCal

  const sortedDays = Object.keys(logs).sort((a, b) => b.localeCompare(a))
  const last7 = sortedDays.slice(0, 7).reverse()

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0F0F0F', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Header */}
      <div style={{ background: '#1A1A1A', padding: '20px 20px 0', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={22} color={ACCENT} />
              <span style={{ fontSize: 20, fontWeight: 700 }}>Calorie Counter</span>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Pro</div>
          </div>
          <button onClick={() => setShowGoal(true)}
            style={{ background: '#2A2A2A', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#F5F5F5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={14} color={ACCENT} />
            <span style={{ fontSize: 13 }}>Goal: {goal}</span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {(['today', 'history', 'stats'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', color: tab === t ? ACCENT : '#888', fontWeight: tab === t ? 600 : 400, fontSize: 14, borderBottom: `2px solid ${tab === t ? ACCENT : 'transparent'}`, transition: 'all .2s' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 20, maxWidth: 500, margin: '0 auto' }}>
        {tab === 'today' && (
          <>
            {/* Calorie Ring */}
            <div style={{ background: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px' }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="#2A2A2A" strokeWidth="12" />
                  <circle cx="70" cy="70" r="60" fill="none" stroke={pct >= 100 ? '#EF4444' : ACCENT}
                    strokeWidth="12" strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`}
                    strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset .5s' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: pct >= 100 ? '#EF4444' : '#F5F5F5' }}>{totalCal}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>kcal eaten</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: remaining < 0 ? '#EF4444' : '#4ADE80' }}>{remaining < 0 ? '+' + Math.abs(remaining) : remaining}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{remaining < 0 ? 'over' : 'remaining'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#60A5FA' }}>{Math.round(totalProtein)}g</div>
                  <div style={{ fontSize: 11, color: '#888' }}>protein</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#FBBF24' }}>{Math.round(totalCarbs)}g</div>
                  <div style={{ fontSize: 11, color: '#888' }}>carbs</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#F87171' }}>{Math.round(totalFat)}g</div>
                  <div style={{ fontSize: 11, color: '#888' }}>fat</div>
                </div>
              </div>
            </div>

            {/* Entries */}
            {log.entries.map(entry => (
              <div key={entry.id} style={{ background: '#1A1A1A', borderRadius: 12, padding: '12px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.name}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g · {entry.time}
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: ACCENT }}>{entry.calories}</div>
                <button onClick={() => deleteEntry(entry.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#666' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {log.entries.length === 0 && !showAdd && (
              <div style={{ textAlign: 'center', color: '#555', padding: '40px 0', fontSize: 14 }}>
                No entries yet — tap + to log food
              </div>
            )}

            {/* Add Food */}
            {showAdd ? (
              <div style={{ background: '#1A1A1A', borderRadius: 16, padding: 20, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontWeight: 600 }}>Add Food</span>
                  <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={18} /></button>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Quick Add</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {COMMON_FOODS.slice(0, 6).map(f => (
                      <button key={f.name} onClick={() => quickAdd(f)}
                        style={{ background: '#2A2A2A', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#F5F5F5', fontSize: 12, cursor: 'pointer' }}>
                        {f.name} <span style={{ color: ACCENT }}>{f.calories}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: 12 }}>
                  <input placeholder="Food name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    style={{ width: '100%', background: '#2A2A2A', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <input placeholder="Calories *" type="number" value={form.calories} onChange={e => setForm(p => ({ ...p, calories: e.target.value }))}
                      style={{ background: '#2A2A2A', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#F5F5F5', fontSize: 14 }} />
                    <input placeholder="Protein (g)" type="number" value={form.protein} onChange={e => setForm(p => ({ ...p, protein: e.target.value }))}
                      style={{ background: '#2A2A2A', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#F5F5F5', fontSize: 14 }} />
                    <input placeholder="Carbs (g)" type="number" value={form.carbs} onChange={e => setForm(p => ({ ...p, carbs: e.target.value }))}
                      style={{ background: '#2A2A2A', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#F5F5F5', fontSize: 14 }} />
                    <input placeholder="Fat (g)" type="number" value={form.fat} onChange={e => setForm(p => ({ ...p, fat: e.target.value }))}
                      style={{ background: '#2A2A2A', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#F5F5F5', fontSize: 14 }} />
                  </div>
                  <button onClick={addEntry}
                    style={{ width: '100%', background: ACCENT, border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                    Add Entry
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAdd(true)}
                style={{ width: '100%', background: ACCENT, border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                <Plus size={18} /> Log Food
              </button>
            )}
          </>
        )}

        {tab === 'history' && (
          <>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>Past days</div>
            {sortedDays.length === 0 && <div style={{ textAlign: 'center', color: '#555', padding: '40px 0', fontSize: 14 }}>No history yet</div>}
            {sortedDays.map(day => {
              const d = logs[day]
              const cal = d.entries.reduce((s, e) => s + e.calories, 0)
              const p = Math.min(100, Math.round((cal / d.goal) * 100))
              const expanded = expandDay === day
              return (
                <div key={day} style={{ background: '#1A1A1A', borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
                  <button onClick={() => setExpandDay(expanded ? null : day)}
                    style={{ width: '100%', background: 'none', border: 'none', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, color: '#F5F5F5' }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{day === today ? 'Today' : day}</div>
                      <div style={{ marginTop: 4, height: 4, background: '#2A2A2A', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: p + '%', background: p >= 100 ? '#EF4444' : ACCENT, borderRadius: 2, transition: 'width .3s' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: p >= 100 ? '#EF4444' : ACCENT }}>{cal}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>/ {d.goal}</div>
                    </div>
                    {expanded ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                  </button>
                  {expanded && (
                    <div style={{ padding: '0 16px 14px', borderTop: '1px solid #2A2A2A' }}>
                      {d.entries.map(e => (
                        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222', fontSize: 13 }}>
                          <span>{e.name}</span>
                          <span style={{ color: ACCENT }}>{e.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {tab === 'stats' && (
          <>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>Last 7 days</div>
            <div style={{ background: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              {last7.length === 0 && <div style={{ textAlign: 'center', color: '#555', fontSize: 14 }}>Not enough data yet</div>}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, justifyContent: 'space-between' }}>
                {last7.map(day => {
                  const d = logs[day]
                  const cal = d.entries.reduce((s, e) => s + e.calories, 0)
                  const maxCal = Math.max(...last7.map(dd => logs[dd].entries.reduce((s, e) => s + e.calories, 0)), 1)
                  const h = Math.round((cal / maxCal) * 80)
                  return (
                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ fontSize: 10, color: '#888' }}>{cal}</div>
                      <div style={{ width: '100%', height: h, background: cal > goal ? '#EF4444' : ACCENT, borderRadius: 4, minHeight: 4 }} />
                      <div style={{ fontSize: 9, color: '#666' }}>{day.slice(5)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
            {last7.length > 0 && (() => {
              const vals = last7.map(day => logs[day].entries.reduce((s, e) => s + e.calories, 0))
              const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
              const best = Math.min(...vals)
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['Avg Daily', avg + ' kcal'], ['Best Day', best + ' kcal'], ['Goal', goal + ' kcal'], ['Days Logged', sortedDays.length.toString()]].map(([label, val]) => (
                    <div key={label} style={{ background: '#1A1A1A', borderRadius: 12, padding: '16px 14px' }}>
                      <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: ACCENT }}>{val}</div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </>
        )}
      </div>

      {/* Goal Modal */}
      {showGoal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100 }}>
          <div style={{ background: '#1A1A1A', borderRadius: 16, padding: 24, width: '100%', maxWidth: 320 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Daily Calorie Goal</div>
            <input type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)}
              style={{ width: '100%', background: '#2A2A2A', border: 'none', borderRadius: 8, padding: '12px', color: '#F5F5F5', fontSize: 18, textAlign: 'center', boxSizing: 'border-box', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowGoal(false)}
                style={{ flex: 1, background: '#2A2A2A', border: 'none', borderRadius: 10, padding: '12px', color: '#F5F5F5', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setGoal(parseInt(goalInput) || 2000); setShowGoal(false) }}
                style={{ flex: 1, background: ACCENT, border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
