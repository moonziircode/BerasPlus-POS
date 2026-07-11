'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, PlusCircle, Search } from 'lucide-react'

interface Option {
  key: string
  name: string
  code: string
}

interface ItemComboboxProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  onAddNew?: (query: string) => void
  placeholder?: string
}

export default function ItemCombobox({
  options,
  value,
  onChange,
  onAddNew,
  placeholder = "Cari Item..."
}: ItemComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Find selected option
  const selectedOption = options.find((opt) => opt.key === value)

  // Filter options based on query
  const filteredOptions = query === '' 
    ? options 
    : options.filter((opt) => 
        opt.name.toLowerCase().includes(query.toLowerCase()) || 
        opt.code.toLowerCase().includes(query.toLowerCase())
      )

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 text-sm shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
          <div className="sticky top-0 z-10 bg-white px-2 py-1.5 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                autoFocus
                className="w-full rounded-md border-0 bg-zinc-50 py-1.5 pl-9 pr-3 text-sm text-zinc-900 focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Ketik untuk mencari..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && query.trim() !== '') {
                    e.preventDefault()
                    if (onAddNew) {
                      onAddNew(query.trim())
                    }
                    setOpen(false)
                    setQuery('')
                  }
                }}
              />
            </div>
          </div>

          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                {query.trim() !== '' ? (
                  <span>Ketik dan tekan <strong className="text-zinc-800 dark:text-zinc-200">Enter</strong> untuk membuat <strong>"{query}"</strong> baru</span>
                ) : (
                  <span>Item tidak ditemukan.</span>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    onChange(opt.key)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700/50 ${
                    value === opt.key ? 'bg-emerald-50 text-emerald-900 font-medium dark:bg-emerald-900/20 dark:text-emerald-100' : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{opt.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{opt.code}</span>
                  </div>
                  {value === opt.key && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
