'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, Users, GraduationCap, Briefcase, CheckCircle, 
  Loader2, RefreshCw, ArrowLeft, Edit, Save, AlertCircle,
  Calendar, UserCheck, Phone, Mail, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import Link from 'next/link'

interface Faculty {
  id: number
  name: string
  code: string
  order_index: number
  week_id: number
  week_name: string
  week_number: number
  status: string
  students_count: number
  teachers_count: number
  employees_count: number
  students_encoded: number
  teachers_encoded: number
  employees_encoded: number
  students_progress: number
  teachers_progress: number
  employees_progress: number
  overall_progress: number
  focal_point_name: string
  focal_point_contact: string
  focal_point_trained: boolean
  notes: string
}

interface Stats {
  total_faculties: number
  completed_faculties: number
  in_progress_faculties: number
  faculties_with_issues: number
  total_students: number
  encoded_students: number
  total_teachers: number
  encoded_teachers: number
  total_employees: number
  encoded_employees: number
  students_progress: number
  teachers_progress: number
  employees_progress: number
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', color: 'bg-gray-400', textColor: 'text-gray-600' },
  { value: 'in_progress', label: 'En cours', color: 'bg-blue-500', textColor: 'text-blue-600' },
  { value: 'completed', label: 'Terminé', color: 'bg-green-500', textColor: 'text-green-600' },
  { value: 'issues', label: 'Problèmes', color: 'bg-red-500', textColor: 'text-red-600' }
]

export default function FacultiesPage() {
  const [loading, setLoading] = useState(true)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [editForm, setEditForm] = useState<Partial<Faculty>>({})
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tracker/faculties')
      const data = await response.json()
      if (data.success) {
        setFaculties(data.data.faculties)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty)
    setEditForm({
      status: faculty.status,
      students_count: faculty.students_count,
      teachers_count: faculty.teachers_count,
      employees_count: faculty.employees_count,
      students_encoded: faculty.students_encoded,
      teachers_encoded: faculty.teachers_encoded,
      employees_encoded: faculty.employees_encoded,
      focal_point_name: faculty.focal_point_name,
      focal_point_contact: faculty.focal_point_contact,
      focal_point_trained: faculty.focal_point_trained,
      notes: faculty.notes
    })
  }

  const handleSave = async () => {
    if (!editingFaculty) return
    setSaving(true)
    try {
      const response = await fetch(`/api/tracker/faculties/${editingFaculty.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const data = await response.json()
      if (data.success) {
        setEditingFaculty(null)
        fetchData()
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status)
    return <Badge className={`${opt?.color} text-white`}>{opt?.label}</Badge>
  }

  const getStatusColor = (status: string) => 
    STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-400'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des facultés...</span>
      </div>
    )
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
              <Building2 className="h-6 w-6 text-primary" />
              Déploiement par Faculté
            </h1>
            <p className="text-gray-500">Suivi de l'encodage des 13 facultés de l'UNIKIN</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Étudiants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.encoded_students?.toLocaleString() || 0}
              <span className="text-sm text-gray-400">/ {stats?.total_students?.toLocaleString() || 0}</span>
            </div>
            <Progress value={stats?.students_progress || 0} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">{stats?.students_progress || 0}% encodés</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Enseignants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.encoded_teachers?.toLocaleString() || 0}
              <span className="text-sm text-gray-400">/ {stats?.total_teachers?.toLocaleString() || 0}</span>
            </div>
            <Progress value={stats?.teachers_progress || 0} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">{stats?.teachers_progress || 0}% encodés</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Employés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.encoded_employees?.toLocaleString() || 0}
              <span className="text-sm text-gray-400">/ {stats?.total_employees?.toLocaleString() || 0}</span>
            </div>
            <Progress value={stats?.employees_progress || 0} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">{stats?.employees_progress || 0}% encodés</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Facultés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.completed_faculties || 0}
              <span className="text-sm text-gray-400">/ {stats?.total_faculties || 0}</span>
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-blue-600">{stats?.in_progress_faculties || 0} en cours</span>
              {stats && stats.faculties_with_issues > 0 && (
                <span className="text-red-600">{stats.faculties_with_issues} problèmes</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des facultés */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {faculties.map((faculty) => (
          <Card 
            key={faculty.id} 
            className={`${faculty.status === 'in_progress' ? 'ring-2 ring-blue-500' : ''} 
                       ${faculty.status === 'issues' ? 'ring-2 ring-red-500' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(faculty.status)}`} />
                    {faculty.code}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">{faculty.name}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(faculty.status)}
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(faculty)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Progression globale */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progression globale</span>
                  <span className="font-semibold">{faculty.overall_progress || 0}%</span>
                </div>
                <Progress value={faculty.overall_progress || 0} className="h-2" />
              </div>

              {/* Détails par type */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <GraduationCap className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <div className="font-semibold">{faculty.students_encoded || 0}/{faculty.students_count || 0}</div>
                  <div className="text-gray-500">Étudiants</div>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <Users className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <div className="font-semibold">{faculty.teachers_encoded || 0}/{faculty.teachers_count || 0}</div>
                  <div className="text-gray-500">Enseignants</div>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <Briefcase className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                  <div className="font-semibold">{faculty.employees_encoded || 0}/{faculty.employees_count || 0}</div>
                  <div className="text-gray-500">Employés</div>
                </div>
              </div>

              {/* Point focal */}
              {faculty.focal_point_name && (
                <div className="pt-2 border-t text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      <span className="text-gray-500">Point focal:</span>
                      <span className="font-medium">{faculty.focal_point_name}</span>
                    </div>
                    {faculty.focal_point_trained && (
                      <Badge variant="outline" className="text-green-600 text-[10px]">Formé</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Semaine assignée */}
              {faculty.week_name && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  Semaine {faculty.week_number}: {faculty.week_name}
                </div>
              )}

              {/* Notes */}
              {faculty.notes && (
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                  <AlertCircle className="h-3 w-3 inline mr-1 text-yellow-600" />
                  {faculty.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog d'édition */}
      <Dialog open={!!editingFaculty} onOpenChange={() => setEditingFaculty(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Modifier la Faculté: {editingFaculty?.name}
            </DialogTitle>
            <DialogDescription>
              Mettez à jour les informations d'encodage et le point focal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Statut */}
            <div>
              <Label>Statut</Label>
              <Select 
                value={editForm.status || ''} 
                onValueChange={(v) => setEditForm({...editForm, status: v})}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Effectifs */}
            <div className="space-y-3">
              <Label className="text-gray-500">Effectifs totaux par catégorie</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Étudiants total</Label>
                  <Input
                    type="number"
                    value={editForm.students_count || ''}
                    onChange={(e) => setEditForm({...editForm, students_count: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label className="text-xs">Enseignants total</Label>
                  <Input
                    type="number"
                    value={editForm.teachers_count || ''}
                    onChange={(e) => setEditForm({...editForm, teachers_count: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label className="text-xs">Employés total</Label>
                  <Input
                    type="number"
                    value={editForm.employees_count || ''}
                    onChange={(e) => setEditForm({...editForm, employees_count: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>

            {/* Encodés */}
            <div className="space-y-3">
              <Label className="text-gray-500">Nombre d'encodés</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Étudiants encodés</Label>
                  <Input
                    type="number"
                    value={editForm.students_encoded || ''}
                    onChange={(e) => setEditForm({...editForm, students_encoded: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label className="text-xs">Enseignants encodés</Label>
                  <Input
                    type="number"
                    value={editForm.teachers_encoded || ''}
                    onChange={(e) => setEditForm({...editForm, teachers_encoded: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label className="text-xs">Employés encodés</Label>
                  <Input
                    type="number"
                    value={editForm.employees_encoded || ''}
                    onChange={(e) => setEditForm({...editForm, employees_encoded: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>

            {/* Point focal */}
            <div className="border-t pt-4">
              <Label className="text-gray-500 mb-3 block">Point Focal</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Nom</Label>
                  <Input
                    value={editForm.focal_point_name || ''}
                    onChange={(e) => setEditForm({...editForm, focal_point_name: e.target.value})}
                    placeholder="Nom du point focal"
                  />
                </div>
                <div>
                  <Label className="text-xs">Contact</Label>
                  <Input
                    value={editForm.focal_point_contact || ''}
                    onChange={(e) => setEditForm({...editForm, focal_point_contact: e.target.value})}
                    placeholder="Téléphone ou email"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  id="focal_trained"
                  checked={editForm.focal_point_trained || false}
                  onChange={(e) => setEditForm({...editForm, focal_point_trained: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="focal_trained">Point focal formé</Label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Remarques, problèmes rencontrés..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFaculty(null)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
