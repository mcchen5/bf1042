import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  available: boolean
}

interface SearchMenuResponse {
  data: MenuItem[]
  total: number
}

interface Props {
  onItemSelect?: (item: MenuItem) => void
  placeholder?: string
  className?: string
}

export function SearchMenu({ onItemSelect, placeholder = "搜尋菜單...", className }: Props) {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const { data, isLoading, error } = useQuery<SearchMenuResponse>({
    queryKey: ['searchMenu', searchTerm],
    queryFn: () => api.menu.search.get({ 
      params: { 
        q: searchTerm,
        limit: 10 
      } 
    }),
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const menuItems = data?.data || []

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(value.length >= 2)
    setSelectedIndex(-1)
  }, [])

  const handleItemSelect = useCallback((item: MenuItem) => {
    setSearchTerm(item.name)
    setIsOpen(false)
    setSelectedIndex(-1)
    onItemSelect?.(item)
  }, [onItemSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || menuItems.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < menuItems.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : menuItems.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < menuItems.length) {
          handleItemSelect(menuItems[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }, [isOpen, menuItems, selectedIndex, handleItemSelect])

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // 延遲關閉以允許點擊選項
    setTimeout(() => {
      if (!e.currentTarget.contains(document.activeElement)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }, 200)
  }, [])

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      selectedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div 
      className={`relative w-full max-w-md ${className}`}
      onBlur={handleBlur}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          aria-label="搜尋菜單"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `menu-item-${selectedIndex}` : undefined}
          role="combobox"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div 
              className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full"
              aria-label="載入中"
            />
          ) : (
            <svg 
              className="h-4 w-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {error ? (
            <div 
              className="px-4 py-3 text-red-600 text-sm"
              role="alert"
              aria-live="polite"
            >
              搜尋時發生錯誤：{error.message}
            </div>
          ) : menuItems.length === 0 && searchTerm.length >= 2 && !isLoading ? (
            <div 
              className="px-4 py-3 text-gray-500 text-sm"
              role="status"
              aria-live="polite"
            >
              找不到相關菜單
            </div>
          ) : (
            <ul 
              ref={listRef}
              className="overflow-y-auto max-h-80"
              role="listbox"
              aria-label="搜尋結果"
            >
              {menuItems.map((item, index) => (
                <li
                  key={item.id}
                  id={`menu-item-${index}`}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    selectedIndex === index ? 'bg-blue-50 border-blue-200' : ''
                  } ${!item.available ? 'opacity-60' : ''}`}
                  onClick={() => handleItemSelect(item)}
                  role="option"
                  aria-selected={selectedIndex === index}
                  aria-disabled={!item.available}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        {!item.available && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            售完
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <span className="font-semibold text-blue-600">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded ml-3 flex-shrink-0"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
