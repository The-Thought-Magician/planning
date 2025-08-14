'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Plus, Edit, Calendar, TrendingUp } from 'lucide-react'
import { format, startOfWeek, endOfWeek } from 'date-fns'

interface WeeklyReview {
  id: string
  weekStarting: Date
  workedWell: string[]
  challenges: string[]
  improvements: string[]
  overallRating: number
  notes?: string
}

const MOCK_REVIEWS: WeeklyReview[] = [
  {
    id: '1',
    weekStarting: startOfWeek(new Date()),
    workedWell: [
      'Consistent morning routine',
      'Met all workout targets',
      'Completed DentenSur feature on time'
    ],
    challenges: [
      'Struggled with focus on Wednesday',
      'Meal timing was off due to late meetings',
      'Didn\'t complete all academic readings'
    ],
    improvements: [
      'Block calendar better for deep work',
      'Prepare meals in advance on Sunday',
      'Set reading schedule with specific times'
    ],
    overallRating: 7,
    notes: 'Good week overall with some room for optimization in time management.'
  }
]

export function WeeklyReview() {
  const [reviews, setReviews] = useState<WeeklyReview[]>(MOCK_REVIEWS)
  const [isCreatingReview, setIsCreatingReview] = useState(false)
  const [newReview, setNewReview] = useState<Partial<WeeklyReview>>({
    workedWell: [],
    challenges: [],
    improvements: [],
    overallRating: 5,
    notes: ''
  })

  const currentWeek = startOfWeek(new Date())
  const hasCurrentWeekReview = reviews.some(review => 
    review.weekStarting.getTime() === currentWeek.getTime()
  )

  const addItem = (category: keyof Pick<WeeklyReview, 'workedWell' | 'challenges' | 'improvements'>, item: string) => {
    if (!item.trim()) return
    setNewReview(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), item.trim()]
    }))
  }

  const removeItem = (category: keyof Pick<WeeklyReview, 'workedWell' | 'challenges' | 'improvements'>, index: number) => {
    setNewReview(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter((_, i) => i !== index)
    }))
  }

  const saveReview = () => {
    if (!newReview.overallRating) return
    
    const review: WeeklyReview = {
      id: Date.now().toString(),
      weekStarting: currentWeek,
      workedWell: newReview.workedWell || [],
      challenges: newReview.challenges || [],
      improvements: newReview.improvements || [],
      overallRating: newReview.overallRating,
      notes: newReview.notes
    }
    
    setReviews(prev => [review, ...prev])
    setIsCreatingReview(false)
    setNewReview({
      workedWell: [],
      challenges: [],
      improvements: [],
      overallRating: 5,
      notes: ''
    })
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600'
    if (rating >= 6) return 'text-blue-600'
    if (rating >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatingText = (rating: number) => {
    if (rating >= 8) return 'Excellent'
    if (rating >= 6) return 'Good'
    if (rating >= 4) return 'Average'
    return 'Needs Improvement'
  }

  return (
    <div className="space-y-6">
      {/* Current Week Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>This Week's Review</CardTitle>
              <CardDescription>
                Week of {format(currentWeek, 'MMM dd')} - {format(endOfWeek(currentWeek), 'MMM dd, yyyy')}
              </CardDescription>
            </div>
            {!hasCurrentWeekReview && !isCreatingReview && (
              <Button onClick={() => setIsCreatingReview(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Review
              </Button>
            )}
          </div>
        </CardHeader>
        
        {!hasCurrentWeekReview && !isCreatingReview && (
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No review created for this week yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Reflect on your week to identify wins and areas for improvement.
              </p>
            </div>
          </CardContent>
        )}

        {isCreatingReview && (
          <CardContent className="space-y-6">
            {/* What Worked Well */}
            <div className="space-y-3">
              <h3 className="font-medium text-green-600">What Worked Well</h3>
              <div className="space-y-2">
                {newReview.workedWell?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <span className="text-sm">{item}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeItem('workedWell', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add something that worked well..."
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addItem('workedWell', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input')
                      if (input) {
                        addItem('workedWell', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Challenges */}
            <div className="space-y-3">
              <h3 className="font-medium text-red-600">Challenges</h3>
              <div className="space-y-2">
                {newReview.challenges?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                    <span className="text-sm">{item}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeItem('challenges', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a challenge you faced..."
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addItem('challenges', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input')
                      if (input) {
                        addItem('challenges', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Improvements */}
            <div className="space-y-3">
              <h3 className="font-medium text-blue-600">Improvements for Next Week</h3>
              <div className="space-y-2">
                {newReview.improvements?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-sm">{item}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeItem('improvements', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an improvement idea..."
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addItem('improvements', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input')
                      if (input) {
                        addItem('improvements', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Overall Rating */}
            <div className="space-y-3">
              <h3 className="font-medium">Overall Week Rating</h3>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setNewReview(prev => ({ ...prev, overallRating: rating }))}
                      className={`w-8 h-8 rounded-full border-2 text-sm font-medium ${
                        rating <= (newReview.overallRating || 0)
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <Badge className={getRatingColor(newReview.overallRating || 0)}>
                  {getRatingText(newReview.overallRating || 0)}
                </Badge>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h3 className="font-medium">Additional Notes</h3>
              <Textarea
                value={newReview.notes || ''}
                onChange={(e) => setNewReview(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional thoughts or observations about this week..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={saveReview}>Save Review</Button>
              <Button variant="outline" onClick={() => setIsCreatingReview(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Previous Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Previous Reviews
          </CardTitle>
          <CardDescription>Track your weekly reflections and improvements over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Week of {format(review.weekStarting, 'MMM dd, yyyy')}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{review.overallRating}/10</span>
                        </div>
                        <Badge className={getRatingColor(review.overallRating)}>
                          {getRatingText(review.overallRating)}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">What Worked Well</h4>
                      <ul className="space-y-1">
                        {review.workedWell.map((item, index) => (
                          <li key={index} className="text-sm text-green-700">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Challenges</h4>
                      <ul className="space-y-1">
                        {review.challenges.map((item, index) => (
                          <li key={index} className="text-sm text-red-700">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-blue-600 mb-2">Improvements</h4>
                      <ul className="space-y-1">
                        {review.improvements.map((item, index) => (
                          <li key={index} className="text-sm text-blue-700">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {review.notes && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{review.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}