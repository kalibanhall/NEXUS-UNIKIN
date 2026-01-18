'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookOpen, Plus, Eye, Edit, Trash2, Search, Loader2, Users, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: number
  code: string
  name: string
  credits: number
  semester: number
  courseType: string
  department: string
  teacher: string
  teacherId: number | null
  enrolledStudents: number
  isActive: boolean
}

interface Stats {
  totalCourses: number
  totalCredits: number
  departmentsCount: number
}

interface Teacher {
  id: number
  name: string
}

interface Promotion {
  id: number
  name: string
  level: string
  department: string
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<Stats>({ totalCourses: 0, totalCredits: 0, departmentsCount: 0 })
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: 3,
    hoursCm: 20,
    hoursTd: 10,
    hoursTp: 10,
    semester: 1,
    courseType: 'OBLIGATOIRE',
    promotionId: '',
    teacherId: ''
  })

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/stats')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des cours')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeachersAndPromotions = async () => {
    try {
      // Fetch teachers
      const teachersRes = await fetch('/api/teachers')
      if (teachersRes.ok) {
        const data = await teachersRes.json()
        const teachersList = data.teachers || data
        setTeachers(Array.isArray(teachersList) ? teachersList.map((t: any) => ({
          id: t.id,
          name: `${t.first_name} ${t.last_name}`
        })) : [])
      }

      // Fetch promotions
      const promotionsRes = await fetch('/api/promotions')
      if (promotionsRes.ok) {
        const data = await promotionsRes.json()
        const promotionsList = data.promotions || data
        setPromotions(Array.isArray(promotionsList) ? promotionsList.map((p: any) => ({
          id: p.id,
          name: p.name,
          level: p.level,
          department: p.department_name
        })) : [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchTeachersAndPromotions()
  }, [])

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.promotionId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          promotionId: parseInt(formData.promotionId),
          teacherId: formData.teacherId ? parseInt(formData.teacherId) : null
        })
      })

      if (response.ok) {
        toast.success('Cours créé avec succès')
        setIsDialogOpen(false)
        resetForm()
        fetchCourses()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur lors de la création')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return

    try {
      const response = await fetch(`/api/courses?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Cours supprimé')
        fetchCourses()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleView = (course: Course) => {
    setSelectedCourse(course)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      credits: 3,
      hoursCm: 20,
      hoursTd: 10,
      hoursTp: 10,
      semester: 1,
      courseType: 'OBLIGATOIRE',
      promotionId: '',
      teacherId: ''
    })
  }

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Cours</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gérer les unités d'enseignement
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau cours
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédits totaux</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Départements</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departmentsCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des cours</CardTitle>
          <CardDescription>{filteredCourses.length} cours trouvé(s)</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Intitulé</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Enseignant</TableHead>
                <TableHead>Étudiants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun cours trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-mono">{course.code}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{course.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.credits} ECTS</Badge>
                    </TableCell>
                    <TableCell>{course.department}</TableCell>
                    <TableCell>{course.teacher}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{course.enrolledStudents}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleView(course)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog création */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau cours</DialogTitle>
            <DialogDescription>
              Créer une nouvelle unité d'enseignement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="INFO101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Crédits ECTS</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Intitulé *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Algorithmique et Programmation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du cours..."
                className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>CM (heures)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.hoursCm}
                  onChange={(e) => setFormData({ ...formData, hoursCm: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>TD (heures)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.hoursTd}
                  onChange={(e) => setFormData({ ...formData, hoursTd: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>TP (heures)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.hoursTp}
                  onChange={(e) => setFormData({ ...formData, hoursTp: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Promotion *</Label>
                <Select
                  value={formData.promotionId}
                  onValueChange={(value) => setFormData({ ...formData, promotionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {promotions.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semestre</Label>
                <Select
                  value={formData.semester.toString()}
                  onValueChange={(value) => setFormData({ ...formData, semester: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semestre 1</SelectItem>
                    <SelectItem value="2">Semestre 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Enseignant</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.courseType}
                  onValueChange={(value) => setFormData({ ...formData, courseType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OBLIGATOIRE">Obligatoire</SelectItem>
                    <SelectItem value="OPTIONNEL">Optionnel</SelectItem>
                    <SelectItem value="LIBRE">Libre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le cours'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCourse?.code} - {selectedCourse?.name}</DialogTitle>
            <DialogDescription>
              Détails du cours
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Département</p>
                  <p className="font-medium">{selectedCourse.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crédits</p>
                  <p className="font-medium">{selectedCourse.credits} ECTS</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Semestre</p>
                  <p className="font-medium">Semestre {selectedCourse.semester}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline">{selectedCourse.courseType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enseignant</p>
                  <p className="font-medium">{selectedCourse.teacher}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Étudiants inscrits</p>
                  <p className="font-medium">{selectedCourse.enrolledStudents}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
