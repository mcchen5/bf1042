import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../api/client'

interface RecommendationItem {
  id: string
  title: string
  description: string
  category: string
  imageUrl?: string
  score: number
  reason: string
  createdAt: string
}

interface RecommendationResponse {
  data: RecommendationItem[]
  total: number
  hasMore: boolean
}

interface Props {
  userId: string
  limit?: number
}

export function PersonalizedRecommendations({ userId, limit = 10 }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { data, isLoading, error, refetch } = useQuery<RecommendationResponse>({
    queryKey: ['recommendations', userId, selectedCategory, limit],
    queryFn: () => api.recommendations.get({ 
      params: { 
        userId, 
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit 
      } 
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })

  const categories = ['all', 'technology', 'lifestyle', 'entertainment', 'education', 'health']

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center p-8"
        role="status"
        aria-label="載入個人化推薦中"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">載入推薦內容中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
        role="alert"
        aria-live="polite"
      >
        <div className="text-red-600 font-medium mb-2">載入推薦失敗</div>
        <div className="text-red-500 text-sm mb-4">
          {error instanceof Error ? error.message : '發生未知錯誤'}
        </div>
        <button
          onClick={handleRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="重新載入推薦"
        >
          重試
        </button>
      </div>
    )
  }

  const recommendations = data?.data || []

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            個人化推薦
          </h1>
          <button
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
            aria-label="重新整理推薦"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-medium text-gray-700 mr-2 self-center">分類：</span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={selectedCategory === category}
              aria-label={`篩選${category === 'all' ? '全部' : category}分類`}
            >
              {category === 'all' ? '全部' : category}
            </button>
          ))}
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div 
          className="text-center py-12 text-gray-500"
          role="status"
          aria-live="polite"
        >
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p>目前沒有推薦內容</p>
          <p className="text-sm mt-1">請稍後再試或調整篩選條件</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            找到 {data?.total || 0} 個推薦項目
          </div>
          
          <div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="推薦項目列表"
          >
            {recommendations.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
                role="listitem"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                )}
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {item.score.toFixed(1)}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {item.description}
                  </p>
                  
                  <div className="bg-gray-50 rounded-md p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-1">推薦原因：</p>
                    <p className="text-sm text-gray-800">{item.reason}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <time dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                    </time>
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                      aria-label={`查看 ${item.title} 詳細內容`}
                    >
                      查看詳情
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {data?.hasMore && (
            <div className="text-center pt-6">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="載入更多推薦"
              >
                載入更多
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
