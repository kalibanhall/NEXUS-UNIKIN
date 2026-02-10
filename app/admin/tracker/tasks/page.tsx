'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, Clock, AlertTriangle, Loader2, Calendar, Filter,
  Plus, Search, ChevronDown, MoreVertical, Eye, Edit, Trash2,
  CheckCircle2, XCircle, RefreshCw, ListTodo, Flag, ArrowLeft,
  ClipboardCheck, User, Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  category: string
  due_date: string
  week_id: number
  phase_id: number
  week_name: string
  week_number: number
  phase_name: string
  progress_percentage: number
  prestataire_completed: boolean
  prestataire_completed_at: string
  prestataire_completed_by: string
  client_validated: boolean
  client_validated_at: string
  client_validated_by: string
  client_validation_notes: string
  is_milestone: boolean
  assigned_to: string
  estimated_hours: number
  actual_hours: number
  subtasks_count: number
  completed_subtasks_count: number
  comments_count: number
  created_at: string
  updated_at: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', color: 'bg-gray-400' },
  { value: 'in_progress', label: 'En cours', color: 'bg-blue-500' },
  { value: 'completed', label: 'Terminé', color: 'bg-green-500' },
  { value: 'blocked', label: 'Bloqué', color: 'bg-red-500' }
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse', color: 'bg-gray-400' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-500' },
  { value: 'high', label: 'Haute', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critique', color: 'bg-red-600' }
]

const CATEGORY_OPTIONS = [
  { value: 'deployment', label: 'Déploiement' },
  { value: 'configuration', label: 'Configuration' },
  { value: 'training', label: 'Formation' },
  { value: 'encoding', label: 'Encodage' },
  { value: 'testing', label: 'Tests' },
  { value: 'bugfix', label: 'Correction' },
  { value: 'optimization', label: 'Optimisation' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'reporting', label: 'Rapport' },
  { value: 'planning', label: 'Planification' },
  { value: 'data_collection', label: 'Collecte données' },
  { value: 'validation', label: 'Validation' }
]

export default function TasksPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [phaseFilter, setPhaseFilter] = useState(searchParams.get('phase_id') || '')
  const [weekFilter, setWeekFilter] = useState(searchParams.get('week_id') || '')

  // Dialog states
  const [showNewTask, setShowNewTask] = useState(false)
  const [showTaskDetails, setShowTaskDetails] = useState<Task | null>(null)
  const [showValidateDialog, setShowValidateDialog] = useState<Task | null>(null)
  const [validationType, setValidationType] = useState<'prestataire' | 'client'>('prestataire')
  const [validationNotes, setValidationNotes] = useState('')
  const [validatorName, setValidatorName] = useState('')

  // New task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
    estimated_hours: '',
    week_id: weekFilter || '',
    is_milestone: false
  })

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (priorityFilter) params.set('priority', priorityFilter)
      if (categoryFilter) params.set('category', categoryFilter)
      if (phaseFilter) params.set('phase_id', phaseFilter)
      if (weekFilter) params.set('week_id', weekFilter)

      const response = await fetch(`/api/tracker/tasks?${params}`)
      const data = await response.json()
      if (data.success) {
        setTasks(data.data.tasks)
        setTotal(data.data.pagination.total)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [page, statusFilter, priorityFilter, categoryFilter, phaseFilter, weekFilter])

  const handleSearch = () => {
    setPage(1)
    fetchTasks()
  }

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/tracker/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          week_id: newTask.week_id ? parseInt(newTask.week_id as string) : null,
          estimated_hours: newTask.estimated_hours ? parseFloat(newTask.estimated_hours) : null
        })
      })
      const data = await response.json()
      if (data.success) {
        setShowNewTask(false)
        setNewTask({
          title: '', description: '', category: '', priority: 'medium',
          due_date: '', assigned_to: '', estimated_hours: '', week_id: '', is_milestone: false
        })
        fetchTasks()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleUpdateStatus = async (taskId: number, status: string) => {
    try {
      const response = await fetch(`/api/tracker/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await response.json()
      if (data.success) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleValidate = async () => {
    if (!showValidateDialog || !validatorName) return
    try {
      const response = await fetch(`/api/tracker/tasks/${showValidateDialog.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validated_by: validatorName,
          user_type: validationType,
          validation_notes: validationNotes
        })
      })
      const data = await response.json()
      if (data.success) {
        setShowValidateDialog(null)
        setValidatorName('')
        setValidationNotes('')
        fetchTasks()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDelete = async (taskId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return
    try {
      const response = await fetch(`/api/tracker/tasks/${taskId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const getStatusColor = (status: string) => 
    STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-400'

  const getPriorityBadge = (priority: string) => {
    const opt = PRIORITY_OPTIONS.find(p => p.value === priority)
    return <Badge className={`${opt?.color} text-white`}>{opt?.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status)
    return <Badge className={`${opt?.color} text-white`}>{opt?.label}</Badge>
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/tracker">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ListTodo className="h-6 w-6 text-primary" />
              Gestion des Tâches
            </h1>
            <p className="text-gray-500">{total} tâches au total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchTasks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle tâche
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle tâche</DialogTitle>
                <DialogDescription>
                  Ajoutez une nouvelle tâche au projet
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Titre *</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Titre de la tâche"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Description détaillée"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Catégorie</Label>
                    <Select 
                      value={newTask.category} 
                      onValueChange={(v) => setNewTask({...newTask, category: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priorité</Label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(v) => setNewTask({...newTask, priority: v})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date d'échéance</Label>
                    <Input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Heures estimées</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newTask.estimated_hours}
                      onChange={(e) => setNewTask({...newTask, estimated_hours: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Assigné à</Label>
                  <Input
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                    placeholder="Nom de la personne"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_milestone"
                    checked={newTask.is_milestone}
                    onChange={(e) => setNewTask({...newTask, is_milestone: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="is_milestone">Marquer comme jalon important</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewTask(false)}>Annuler</Button>
                <Button onClick={handleCreateTask} disabled={!newTask.title}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes</SelectItem>
                {PRIORITY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes</SelectItem>
                {CATEGORY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tâches */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={`hover:shadow-md transition-shadow ${task.is_milestone ? 'ring-2 ring-purple-500' : ''}`}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusColor(task.status)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        {task.is_milestone && (
                          <Flag className="h-4 w-4 text-purple-500" />
                        )}
                        {getPriorityBadge(task.priority)}
                        {task.category && (
                          <Badge variant="outline" className="capitalize">
                            {task.category.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {task.week_name} • Phase: {task.phase_name || 'N/A'}
                      </p>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {task.assigned_to && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assigned_to}
                          </span>
                        )}
                        {task.subtasks_count > 0 && (
                          <span>
                            {task.completed_subtasks_count}/{task.subtasks_count} sous-tâches
                          </span>
                        )}
                        {task.comments_count > 0 && (
                          <span>{task.comments_count} commentaires</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Statut validation */}
                    <div className="flex items-center gap-1">
                      {task.prestataire_completed ? (
                        <span title={`Terminé par ${task.prestataire_completed_by}`}>
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        </span>
                      ) : (
                        <span title="Non terminé"><XCircle className="h-5 w-5 text-gray-300" /></span>
                      )}
                      {task.client_validated ? (
                        <span title={`Validé par ${task.client_validated_by}`}>
                          <ClipboardCheck className="h-5 w-5 text-green-500" />
                        </span>
                      ) : (
                        <span title="Non validé"><ClipboardCheck className="h-5 w-5 text-gray-300" /></span>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowTaskDetails(task)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                          disabled={task.status === 'in_progress'}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Marquer en cours
                        </DropdownMenuItem>
                        {!task.prestataire_completed && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setValidationType('prestataire')
                              setShowValidateDialog(task)
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Marquer terminé (Prestataire)
                          </DropdownMenuItem>
                        )}
                        {task.prestataire_completed && !task.client_validated && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setValidationType('client')
                              setShowValidateDialog(task)
                            }}
                          >
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                            Valider (Client)
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(task.id, 'blocked')}
                          className="text-red-600"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Marquer bloqué
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {tasks.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <ListTodo className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucune tâche trouvée</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialog de validation */}
      <Dialog open={!!showValidateDialog} onOpenChange={() => setShowValidateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationType === 'prestataire' ? 'Marquer comme terminé' : 'Valider la tâche'}
            </DialogTitle>
            <DialogDescription>
              {validationType === 'prestataire' 
                ? 'Confirmez que vous avez terminé cette tâche'
                : 'Validez que cette tâche répond aux exigences'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {showValidateDialog && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium">{showValidateDialog.title}</p>
                <p className="text-sm text-gray-500">{showValidateDialog.week_name}</p>
              </div>
            )}
            <div>
              <Label>Votre nom *</Label>
              <Input
                value={validatorName}
                onChange={(e) => setValidatorName(e.target.value)}
                placeholder="Entrez votre nom"
              />
            </div>
            {validationType === 'client' && (
              <div>
                <Label>Notes de validation</Label>
                <Textarea
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Commentaires ou remarques..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidateDialog(null)}>
              Annuler
            </Button>
            <Button onClick={handleValidate} disabled={!validatorName}>
              {validationType === 'prestataire' ? 'Marquer terminé' : 'Valider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog détails tâche */}
      <Dialog open={!!showTaskDetails} onOpenChange={() => setShowTaskDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showTaskDetails?.title}
              {showTaskDetails?.is_milestone && <Flag className="h-4 w-4 text-purple-500" />}
            </DialogTitle>
            <DialogDescription>{showTaskDetails?.week_name}</DialogDescription>
          </DialogHeader>
          {showTaskDetails && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(showTaskDetails.status)}
                {getPriorityBadge(showTaskDetails.priority)}
                {showTaskDetails.category && (
                  <Badge variant="outline" className="capitalize">
                    {showTaskDetails.category.replace('_', ' ')}
                  </Badge>
                )}
              </div>

              {showTaskDetails.description && (
                <div>
                  <Label className="text-gray-500">Description</Label>
                  <p className="mt-1">{showTaskDetails.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {showTaskDetails.due_date && (
                  <div>
                    <Label className="text-gray-500">Date d'échéance</Label>
                    <p>{new Date(showTaskDetails.due_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {showTaskDetails.assigned_to && (
                  <div>
                    <Label className="text-gray-500">Assigné à</Label>
                    <p>{showTaskDetails.assigned_to}</p>
                  </div>
                )}
                {showTaskDetails.estimated_hours && (
                  <div>
                    <Label className="text-gray-500">Heures estimées</Label>
                    <p>{showTaskDetails.estimated_hours}h</p>
                  </div>
                )}
                {showTaskDetails.actual_hours && (
                  <div>
                    <Label className="text-gray-500">Heures réelles</Label>
                    <p>{showTaskDetails.actual_hours}h</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <Label className="text-gray-500">Statut de validation</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Validation Prestataire</span>
                    {showTaskDetails.prestataire_completed ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">{showTaskDetails.prestataire_completed_by}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">En attente</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Validation Client</span>
                    {showTaskDetails.client_validated ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">{showTaskDetails.client_validated_by}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">En attente</span>
                    )}
                  </div>
                  {showTaskDetails.client_validation_notes && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      <Label className="text-blue-600">Notes client:</Label>
                      <p>{showTaskDetails.client_validation_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDetails(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
