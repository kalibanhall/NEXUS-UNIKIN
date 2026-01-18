'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle, Plus, MoreVertical } from 'lucide-react'

const mockTasks = [
  {
    id: 1,
    title: 'Valider les inscriptions L1 Sciences',
    description: 'Vérifier et valider les dossiers d\'inscription des étudiants de première année',
    priority: 'haute',
    dueDate: '2024-01-20',
    status: 'en cours'
  },
  {
    id: 2,
    title: 'Préparer les attestations de fin d\'études',
    description: 'Générer les attestations pour les étudiants diplômés de la session de décembre',
    priority: 'moyenne',
    dueDate: '2024-01-22',
    status: 'à faire'
  },
  {
    id: 3,
    title: 'Mise à jour des dossiers étudiants',
    description: 'Mettre à jour les informations personnelles des étudiants ayant changé d\'adresse',
    priority: 'basse',
    dueDate: '2024-01-25',
    status: 'à faire'
  },
  {
    id: 4,
    title: 'Vérifier les paiements en attente',
    description: 'Traiter les paiements en attente depuis plus de 48h',
    priority: 'haute',
    dueDate: '2024-01-18',
    status: 'terminée'
  },
  {
    id: 5,
    title: 'Archiver les anciens dossiers',
    description: 'Archiver les dossiers des étudiants ayant quitté l\'université',
    priority: 'basse',
    dueDate: '2024-01-30',
    status: 'à faire'
  },
]

export default function EmployeeTasksPage() {
  const [tasks] = useState(mockTasks)

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'haute':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Haute</Badge>
      case 'moyenne':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Moyenne</Badge>
      case 'basse':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Basse</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'terminée':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'en cours':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'à faire':
        return <AlertCircle className="h-5 w-5 text-gray-400" />
      default:
        return null
    }
  }

  const tasksByStatus = {
    'à faire': tasks.filter(t => t.status === 'à faire'),
    'en cours': tasks.filter(t => t.status === 'en cours'),
    'terminée': tasks.filter(t => t.status === 'terminée'),
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mes Tâches</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gérer vos tâches quotidiennes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À faire</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksByStatus['à faire'].length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{tasksByStatus['en cours'].length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tasksByStatus['terminée'].length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Column: À faire */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            À faire
          </h2>
          {tasksByStatus['à faire'].map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {task.description}
                </p>
                <div className="flex justify-between items-center">
                  {getPriorityBadge(task.priority)}
                  <span className="text-xs text-gray-500">
                    Échéance: {task.dueDate}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Column: En cours */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            En cours
          </h2>
          {tasksByStatus['en cours'].map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-600">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {task.description}
                </p>
                <div className="flex justify-between items-center">
                  {getPriorityBadge(task.priority)}
                  <span className="text-xs text-gray-500">
                    Échéance: {task.dueDate}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Column: Terminées */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Terminées
          </h2>
          {tasksByStatus['terminée'].map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow opacity-75">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium line-through">{task.title}</h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {task.description}
                </p>
                <div className="flex justify-between items-center">
                  {getPriorityBadge(task.priority)}
                  <span className="text-xs text-gray-500">
                    Terminée le: {task.dueDate}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
