import { useState, useEffect } from 'react'

const UNITS = [
  'g', 'kg', 'ml', 'L',
  'taza(s)', 'cucharada(s)', 'cucharadita(s)',
  'pizca', 'pz', 'oz', 'lb',
  'sobre(s)', 'rebanada(s)', 'diente(s)',
  'rama(s)', 'hoja(s)', 'al gusto', 'paquete(s)',
]

interface UnitInputProps {
  value: string
  onChange: (val: string) => void
}

export default function UnitInput({ value, onChange }: UnitInputProps) {
  const isOther = value !== '' && !UNITS.includes(value)
  const [showCustom, setShowCustom] = useState(isOther)

  // Si el valor externo ya es "otro" (al cargar en edición), mostrar input libre
  useEffect(() => {
    if (value !== '' && !UNITS.includes(value)) setShowCustom(true)
  }, [])

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === '__otro__') {
      setShowCustom(true)
      onChange('')
    } else {
      setShowCustom(false)
      onChange(val)
    }
  }

  const selectValue = showCustom ? '__otro__' : (UNITS.includes(value) ? value : '')

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={selectValue}
        onChange={handleSelect}
        className="input-base"
        style={{ appearance: 'auto' }}
      >
        <option value="" disabled>Unidad</option>
        {UNITS.map(u => (
          <option key={u} value={u}>{u}</option>
        ))}
        <option value="__otro__">Otro…</option>
      </select>

      {showCustom && (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input-base"
          placeholder="Escribe la unidad"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      )}
    </div>
  )
}
