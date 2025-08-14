'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Save, 
  Trash2, 
  Copy, 
  Clock,
  Calendar,
  Settings,
  Zap
} from 'lucide-react'
import { TIME_BLOCK_CATEGORIES } from '@/lib/constants'
import { TimeBlockCategory } from '@prisma/client'
import { useForm } from 'react-hook-form'

interface TimeBlockForm {
  title: string
  description?: string
  category: TimeBlockCategory
  startTime: string
  endTime: string
  notes?: string
}

const scheduleTemplates = [
  {
    id: 'default',
    name: 'Default Lock-In Schedule',
    description: 'Standard daily protocol',
    blocks: [
      { title: 'Morning HIIT', category: 'HIIT_MORNING', startTime: '05:25', endTime: '05:40' },
      { title: 'Morning Mobility', category: 'MOBILITY_MORNING', startTime: '05:45', endTime: '05:55' },
      { title: 'Buffer Time', category: 'BUFFER_TIME', startTime: '06:00', endTime: '08:00' },
      { title: 'Breakfast', category: 'MEAL_BREAKFAST', startTime: '08:00', endTime: '08:30' },
      { title: 'DSA Deep Work', category: 'DEEP_WORK_DSA', startTime: '09:00', endTime: '12:00' },
      { title: 'Lunch Break', category: 'MEAL_LUNCH', startTime: '13:00', endTime: '14:00' },
    ]
  },
  {
    id: 'intensive',
    name: 'Intensive Study Day',
    description: 'Maximum focus schedule',
    blocks: [
      { title: 'Morning HIIT', category: 'HIIT_MORNING', startTime: '05:25', endTime: '05:40' },
      { title: 'DSA Deep Work', category: 'DEEP_WORK_DSA', startTime: '08:00', endTime: '11:00' },
      { title: 'Dentensur Work', category: 'DEEP_WORK_DENTENSUR', startTime: '13:00', endTime: '16:00' },
      { title: 'AI Bard Work', category: 'DEEP_WORK_AI_BARD', startTime: '19:00', endTime: '22:00' },
    ]
  }
]

export function ScheduleEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingBlock, setEditingBlock] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TimeBlockForm>()

  const selectedCategory = watch('category')
  const categoryData = selectedCategory ? TIME_BLOCK_CATEGORIES[selectedCategory] : null

  const onSubmit = (data: TimeBlockForm) => {
    console.log('Saving time block:', data)
    // Here you would save to the database
    setIsEditing(false)
    reset()
  }

  const handleEditBlock = (block: any) => {
    setEditingBlock(block)
    setIsEditing(true)
    setValue('title', block.title)
    setValue('category', block.category)
    setValue('startTime', block.startTime)
    setValue('endTime', block.endTime)
    setValue('description', block.description || '')
    setValue('notes', block.notes || '')
  }

  const handleNewBlock = () => {
    setEditingBlock(null)
    setIsEditing(true)
    reset()
  }

  const applyTemplate = (templateId: string) => {
    const template = scheduleTemplates.find(t => t.id === templateId)
    if (template) {
      console.log('Applying template:', template.name)
      // Here you would apply the template to the schedule
      setSelectedTemplate(templateId)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Schedule Editor</CardTitle>
        <CardDescription>Create and manage time blocks</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            {!isEditing ? (
              <div className="space-y-3">
                <Button onClick={handleNewBlock} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Block
                </Button>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate Day
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Copy to Week
                  </Button>
                </div>

                {/* Recent Time Blocks */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Recent Blocks</Label>
                  <div className="space-y-1">
                    {[
                      { title: 'DSA Deep Work', category: 'DEEP_WORK_DSA', time: '09:00-12:00' },
                      { title: 'Upper Body Workout', category: 'WORKOUT_UPPER_1', time: '16:30-18:00' },
                      { title: 'Dentensur Work', category: 'DEEP_WORK_DENTENSUR', time: '21:00-23:00' },
                    ].map((block, index) => {
                      const categoryData = TIME_BLOCK_CATEGORIES[block.category as TimeBlockCategory]
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-muted/30"
                          onClick={() => handleEditBlock(block)}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{categoryData.icon}</span>
                            <div>
                              <div className="text-sm font-medium">{block.title}</div>
                              <div className="text-xs text-muted-foreground">{block.time}</div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="e.g., DSA Deep Work"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue('category', value as TimeBlockCategory)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIME_BLOCK_CATEGORIES).map(([key, data]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <span>{data.icon}</span>
                            <span>{data.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categoryData && (
                    <Badge 
                      variant="outline"
                      style={{ 
                        backgroundColor: `${categoryData.color}10`, 
                        borderColor: `${categoryData.color}30`,
                        color: categoryData.color 
                      }}
                    >
                      {categoryData.label}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...register('startTime', { required: 'Start time is required' })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      {...register('endTime', { required: 'End time is required' })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    {...register('description')}
                    placeholder="Brief description of the activity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {editingBlock ? 'Update' : 'Save'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  {editingBlock && (
                    <Button type="button" variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-3">
              {scheduleTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/60'
                  }`}
                  onClick={() => applyTemplate(template.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">{template.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {template.blocks.length} time blocks
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {template.id === selectedTemplate && (
                        <Badge variant="secondary">Applied</Badge>
                      )}
                      <Button size="sm" variant="ghost">
                        <Zap className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {template.blocks.slice(0, 3).map((block, index) => {
                      const categoryData = TIME_BLOCK_CATEGORIES[block.category as TimeBlockCategory]
                      return (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <span>{categoryData.icon}</span>
                          <span>{block.startTime}</span>
                          <span className="text-muted-foreground">-</span>
                          <span>{block.endTime}</span>
                          <span className="text-muted-foreground">{block.title}</span>
                        </div>
                      )
                    })}
                    {template.blocks.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{template.blocks.length - 3} more blocks...
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}