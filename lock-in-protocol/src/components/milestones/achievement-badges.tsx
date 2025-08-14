'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Award, Lock, Star, Trophy, Target } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: string
  unlockedAt?: Date
  progress: number
  requirement: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Early Bird',
    description: 'Complete morning routine 7 days straight',
    icon: '🌅',
    category: 'Habits',
    unlockedAt: new Date('2024-01-10'),
    progress: 100,
    requirement: '7 consecutive morning routines',
    rarity: 'common'
  },
  {
    id: '2',
    title: 'Coding Streak Master',
    description: 'Code for 30 consecutive days',
    icon: '💻',
    category: 'Professional',
    unlockedAt: new Date('2024-01-12'),
    progress: 100,
    requirement: '30 consecutive coding days',
    rarity: 'rare'
  },
  {
    id: '3',
    title: 'Fitness Warrior',
    description: 'Complete 50 workouts',
    icon: '💪',
    category: 'Fitness',
    progress: 76,
    requirement: '50 completed workouts',
    rarity: 'epic'
  },
  {
    id: '4',
    title: 'Academic Excellence',
    description: 'Achieve 9+ CGPA in semester',
    icon: '🎓',
    category: 'Academic',
    progress: 45,
    requirement: 'CGPA above 9.0',
    rarity: 'legendary'
  },
  {
    id: '5',
    title: 'Hydration Hero',
    description: 'Meet daily water goal for 14 days',
    icon: '💧',
    category: 'Health',
    progress: 85,
    requirement: '14 consecutive hydration goals',
    rarity: 'rare'
  },
  {
    id: '6',
    title: 'Project Pioneer',
    description: 'Launch a major project version',
    icon: '🚀',
    category: 'Professional',
    unlockedAt: new Date('2024-01-08'),
    progress: 100,
    requirement: 'Launch major project update',
    rarity: 'epic'
  }
]

export function AchievementBadges() {
  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.unlockedAt)
  const inProgressAchievements = ACHIEVEMENTS.filter(a => !a.unlockedAt && a.progress > 0)
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.unlockedAt && a.progress === 0)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500'
      case 'rare': return 'bg-blue-500'  
      case 'epic': return 'bg-purple-500'
      case 'legendary': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300'
      case 'rare': return 'border-blue-300'
      case 'epic': return 'border-purple-300' 
      case 'legendary': return 'border-yellow-300'
      default: return 'border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unlocked</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{unlockedAchievements.length}</div>
            <p className="text-xs text-muted-foreground">achievements earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressAchievements.length}</div>
            <p className="text-xs text-muted-foreground">working towards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{lockedAchievements.length}</div>
            <p className="text-xs text-muted-foreground">yet to discover</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%
            </div>
            <Progress 
              value={(unlockedAchievements.length / ACHIEVEMENTS.length) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Unlocked Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Unlocked Achievements
          </CardTitle>
          <CardDescription>Congratulations on your accomplishments!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unlockedAchievements.map(achievement => (
              <Card key={achievement.id} className={`border-2 ${getRarityBorder(achievement.rarity)} bg-gradient-to-br from-yellow-50 to-yellow-100`}>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h3 className="font-semibold mb-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  <Badge className={`${getRarityColor(achievement.rarity)} text-white`}>
                    {achievement.rarity}
                  </Badge>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* In Progress Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            In Progress
          </CardTitle>
          <CardDescription>Keep working towards these achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressAchievements.map(achievement => (
              <Card key={achievement.id} className={`border ${getRarityBorder(achievement.rarity)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">{achievement.requirement}</p>
                      </div>
                      <Badge className={`${getRarityColor(achievement.rarity)} text-white mt-2`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Locked Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Locked Achievements
          </CardTitle>
          <CardDescription>Mystery achievements waiting to be discovered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lockedAchievements.map(achievement => (
              <Card key={achievement.id} className="border opacity-60">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2 grayscale">❓</div>
                  <h3 className="font-semibold mb-1 text-muted-foreground">???</h3>
                  <p className="text-sm text-muted-foreground mb-2">This achievement is locked</p>
                  <Badge variant="outline" className="text-muted-foreground">
                    {achievement.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}