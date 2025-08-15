'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Clock, Pill, CheckCircle, Calendar, Info, Target } from 'lucide-react'
import { SupplementType } from '@prisma/client'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface SupplementLog {
  id: string
  date: Date
  supplementType: SupplementType
  timing: string
  completed: boolean
  actualTime?: string
  notes?: string
}

interface SupplementProtocol {
  type: SupplementType
  name: string
  dosage: string
  timing: string[]
  benefits: string
  priority: 'essential' | 'important' | 'optional'
  instructions: string
  color: string
}

const SUPPLEMENT_PROTOCOLS: SupplementProtocol[] = [
  {
    type: SupplementType.CREATINE_MONOHYDRATE,
    name: 'Creatine Monohydrate',
    dosage: '5g daily',
    timing: ['08:00', '17:30'], // Morning and post-workout
    benefits: 'Improved strength, power, and muscle growth',
    priority: 'essential',
    instructions: 'Take with water or juice. Timing is flexible but consistent daily intake is key.',
    color: 'bg-blue-500'
  },
  {
    type: SupplementType.WHEY_PROTEIN,
    name: 'Whey Protein Powder',
    dosage: '25-30g per serving',
    timing: ['17:30'], // Post-workout
    benefits: 'Fast-absorbing protein for muscle protein synthesis',
    priority: 'essential',
    instructions: 'Mix with 300-400ml water or milk. Best within 30 minutes post-workout.',
    color: 'bg-green-500'
  },
  {
    type: SupplementType.MILK_POST_WORKOUT,
    name: 'Post-Workout Milk',
    dosage: '500ml',
    timing: ['17:45'], // 15 minutes after protein shake
    benefits: 'Additional protein and carbs for recovery',
    priority: 'important',
    instructions: 'Drink 15-30 minutes after whey protein for sustained amino acid release.',
    color: 'bg-yellow-500'
  },
  {
    type: SupplementType.MILK_PRE_SLEEP,
    name: 'Pre-Sleep Milk',
    dosage: '250-300ml',
    timing: ['22:30'], // Before bed
    benefits: 'Casein protein for overnight muscle recovery',
    priority: 'important',
    instructions: 'Drink 30-60 minutes before sleep for sustained overnight protein synthesis.',
    color: 'bg-purple-500'
  }
]

export function SupplementLogger() {
  const [todaySupplements, setTodaySupplements] = useState<SupplementLog[]>([])
  // const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    // Initialize today's supplements based on protocols
    const today = new Date()
    const initialSupplements: SupplementLog[] = []
    
    SUPPLEMENT_PROTOCOLS.forEach(protocol => {
      protocol.timing.forEach((time, index) => {
        initialSupplements.push({
          id: `${protocol.type}-${index}`,
          date: today,
          supplementType: protocol.type,
          timing: time,
          completed: false
        })
      })
    })
    
    setTodaySupplements(initialSupplements)
  }, [])

  const toggleSupplementCompletion = (supplementId: string) => {
    setTodaySupplements(prev => prev.map(supplement => {
      if (supplement.id === supplementId) {
        const updated = {
          ...supplement,
          completed: !supplement.completed,
          actualTime: !supplement.completed ? new Date().toTimeString().slice(0, 5) : undefined
        }
        
        if (updated.completed) {
          const protocol = SUPPLEMENT_PROTOCOLS.find(p => p.type === supplement.supplementType)
          toast.success(`${protocol?.name || 'Supplement'} logged!`)
        }
        
        return updated
      }
      return supplement
    }))
  }

  const getCompletionRate = () => {
    const completed = todaySupplements.filter(s => s.completed).length
    return (completed / todaySupplements.length) * 100
  }

  const getTimingStatus = (supplement: SupplementLog) => {
    if (!supplement.completed || !supplement.actualTime) {return 'pending'}
    
    const planned = new Date(`2000-01-01T${supplement.timing}:00`)
    const actual = new Date(`2000-01-01T${supplement.actualTime}:00`)
    const diffMinutes = Math.abs(actual.getTime() - planned.getTime()) / (1000 * 60)
    
    // Different windows based on supplement type
    let window = 60 // default 1 hour
    if (supplement.supplementType === SupplementType.WHEY_PROTEIN) {
      window = 30 // Critical post-workout window
    }
    
    if (diffMinutes <= window / 2) {return 'on-time'}
    if (diffMinutes <= window) {return 'acceptable'}
    return 'late'
  }

  const getTimingBadge = (status: string) => {
    switch (status) {
      case 'on-time':
        return <Badge className="bg-green-500 text-white">On Time</Badge>
      case 'acceptable':
        return <Badge className="bg-yellow-500 text-white">Close</Badge>
      case 'late':
        return <Badge className="bg-red-500 text-white">Late</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'border-l-red-500'
      case 'important': return 'border-l-yellow-500'
      case 'optional': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  const currentTime = new Date().toTimeString().slice(0, 5)
  const completedSupplements = todaySupplements.filter(s => s.completed).length
  const essentialCompleted = todaySupplements.filter(s => {
    const protocol = SUPPLEMENT_PROTOCOLS.find(p => p.type === s.supplementType)
    return s.completed && protocol?.priority === 'essential'
  }).length
  const totalEssential = todaySupplements.filter(s => {
    const protocol = SUPPLEMENT_PROTOCOLS.find(p => p.type === s.supplementType)
    return protocol?.priority === 'essential'
  }).length

  return (
    <div className="space-y-6">
      {/* Daily Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplements Today</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSupplements}/{todaySupplements.length}</div>
            <Progress value={getCompletionRate()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Essential Complete</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{essentialCompleted}/{totalEssential}</div>
            <p className="text-xs text-muted-foreground">critical supplements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(getCompletionRate())}%</div>
            <p className="text-xs text-muted-foreground">today&apos;s compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTime}</div>
            <p className="text-xs text-muted-foreground">{format(new Date(), 'MMM dd, yyyy')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Supplement Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Supplement Schedule
          </CardTitle>
          <CardDescription>
            Track your supplement timing and completion throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todaySupplements
              .sort((a, b) => a.timing.localeCompare(b.timing))
              .map((supplement) => {
                const protocol = SUPPLEMENT_PROTOCOLS.find(p => p.type === supplement.supplementType)
                const timingStatus = getTimingStatus(supplement)
                
                return (
                  <Card key={supplement.id} className={`border-l-4 ${getPriorityColor(protocol?.priority || 'optional')}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={supplement.completed}
                            onCheckedChange={() => toggleSupplementCompletion(supplement.id)}
                            className="h-5 w-5"
                          />
                          <div>
                            <CardTitle className="text-lg">{protocol?.name || supplement.supplementType}</CardTitle>
                            <CardDescription>
                              Planned: {supplement.timing}
                              {supplement.actualTime && ` | Taken: ${supplement.actualTime}`}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTimingBadge(timingStatus)}
                          <Badge 
                            variant="outline" 
                            className={`${protocol?.color} text-white`}
                          >
                            {protocol?.priority || 'optional'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Dosage & Benefits</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><strong>Dosage:</strong> {protocol?.dosage}</p>
                            <p><strong>Benefits:</strong> {protocol?.benefits}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Instructions</h4>
                          <p className="text-sm text-muted-foreground">
                            {protocol?.instructions}
                          </p>
                        </div>
                      </div>

                      {supplement.completed && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              Completed at {supplement.actualTime}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Supplement Protocols Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Supplement Protocols
          </CardTitle>
          <CardDescription>
            Your personalized supplementation strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPLEMENT_PROTOCOLS.map((protocol, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{protocol.name}</CardTitle>
                    <Badge className={`${protocol.color} text-white`}>
                      {protocol.priority}
                    </Badge>
                  </div>
                  <CardDescription>{protocol.dosage}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Timing</h4>
                    <div className="flex gap-1 mt-1">
                      {protocol.timing.map((time, timeIndex) => (
                        <Badge key={timeIndex} variant="outline">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">Benefits</h4>
                    <p className="text-sm text-muted-foreground">{protocol.benefits}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-sm">Instructions</h4>
                    <p className="text-xs text-muted-foreground">{protocol.instructions}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Supplement Adherence</CardTitle>
          <CardDescription>
            Track consistency across different supplement types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUPPLEMENT_PROTOCOLS.map((protocol, index) => {
              const protocolSupplements = todaySupplements.filter(s => s.supplementType === protocol.type)
              const completed = protocolSupplements.filter(s => s.completed).length
              const completionRate = protocolSupplements.length > 0 ? (completed / protocolSupplements.length) * 100 : 0
              
              return (
                <Card key={index}>
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">{protocol.name}</h4>
                      <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
                      <Progress value={completionRate} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {completed}/{protocolSupplements.length} today
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}