'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Search, Plus, Bell, Send, Trash2, Edit, Eye, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Announcement {
  id: number
  title: string
  content: string
  target: string
  priority: string
  isPublished: boolean
  publishedAt: string | null
  expiresAt: string | null
  viewsCount: number
  author: string
  createdAt: string
  updatedAt: string
}

interface Stats {
  total: number
  published: number
  draft: number
  urgent: number
}

const targetLabels: Record<string, string> = {
  'ALL': 'Tous',
  'STUDENTS': 'Étudiants',
  'TEACHERS': 'Enseignants',
  'EMPLOYEES': 'Employés',
  'ADMIN': 'Administration'
}

const priorityLabels: Record<string, string> = {
  'URGENT': 'Urgent',
  'HIGH': 'Haute',
  'NORMAL': 'Normale',
  'LOW': 'Basse'
}

const priorityColors: Record<string, string> = {
  'URGENT': 'bg-red-500',
  'HIGH': 'bg-orange-500',
  'NORMAL': 'bg-blue-500',
  'LOW': 'bg-gray-500'
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0, urgent: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: 'ALL',
    priority: 'NORMAL',
    isPublished: false
  })

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements')
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des annonces')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsSubmitting(true)
    try {
      const method = selectedAnnouncement ? 'PUT' : 'POST'
      const body = selectedAnnouncement 
        ? { ...formData, id: selectedAnnouncement.id }
        : formData

      const response = await fetch('/api/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        toast.success(selectedAnnouncement ? 'Annonce mise à jour' : 'Annonce créée')
        setIsDialogOpen(false)
        resetForm()
        fetchAnnouncements()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'opération')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'opération')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return

    try {
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Annonce supprimée')
        fetchAnnouncements()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handlePublish = async (announcement: Announcement) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: announcement.id, isPublished: true })
      })

      if (response.ok) {
        toast.success('Annonce publiée')
        fetchAnnouncements()
      } else {
        toast.error('Erreur lors de la publication')
      }
    } catch (error) {
      toast.error('Erreur lors de la publication')
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target: announcement.target,
      priority: announcement.priority,
      isPublished: announcement.isPublished
    })
    setIsDialogOpen(true)
  }

  const handleView = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setSelectedAnnouncement(null)
    setFormData({
      title: '',
      content: '',
      target: 'ALL',
      priority: 'NORMAL',
      isPublished: false
    })
  }

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

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
          <h1 className="text-3xl font-bold">Annonces</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gérer les communications officielles
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle annonce
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total annonces</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des annonces</CardTitle>
          <CardDescription>
            {filteredAnnouncements.length} annonce(s) trouvée(s)
          </CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une annonce..."
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
                <TableHead>Titre</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vues</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune annonce trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {announcement.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{targetLabels[announcement.target] || announcement.target}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[announcement.priority]}>
                        {priorityLabels[announcement.priority] || announcement.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={announcement.isPublished ? 'default' : 'secondary'}>
                        {announcement.isPublished ? 'Publiée' : 'Brouillon'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(announcement.createdAt)}</TableCell>
                    <TableCell>{announcement.viewsCount}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleView(announcement)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(announcement)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!announcement.isPublished && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600"
                          onClick={() => handlePublish(announcement)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDelete(announcement.id)}
                      >
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

      {/* Dialog création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAnnouncement ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations pour {selectedAnnouncement ? 'modifier' : 'créer'} l'annonce.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de l'annonce"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenu *</Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Contenu de l'annonce..."
                className="w-full min-h-[150px] px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cible</Label>
                <Select
                  value={formData.target}
                  onValueChange={(value) => setFormData({ ...formData, target: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous</SelectItem>
                    <SelectItem value="STUDENTS">Étudiants</SelectItem>
                    <SelectItem value="TEACHERS">Enseignants</SelectItem>
                    <SelectItem value="EMPLOYEES">Employés</SelectItem>
                    <SelectItem value="ADMIN">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="HIGH">Haute</SelectItem>
                    <SelectItem value="NORMAL">Normale</SelectItem>
                    <SelectItem value="LOW">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isPublished">Publier immédiatement</Label>
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
                  Enregistrement...
                </>
              ) : (
                selectedAnnouncement ? 'Mettre à jour' : 'Créer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              Par {selectedAnnouncement?.author} • {formatDate(selectedAnnouncement?.createdAt || null)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="outline">
                {targetLabels[selectedAnnouncement?.target || 'ALL']}
              </Badge>
              <Badge className={priorityColors[selectedAnnouncement?.priority || 'NORMAL']}>
                {priorityLabels[selectedAnnouncement?.priority || 'NORMAL']}
              </Badge>
              <Badge variant={selectedAnnouncement?.isPublished ? 'default' : 'secondary'}>
                {selectedAnnouncement?.isPublished ? 'Publiée' : 'Brouillon'}
              </Badge>
            </div>

            <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
              {selectedAnnouncement?.content}
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{selectedAnnouncement?.viewsCount} vue(s)</span>
              {selectedAnnouncement?.publishedAt && (
                <span>Publiée le {formatDate(selectedAnnouncement.publishedAt)}</span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              if (selectedAnnouncement) handleEdit(selectedAnnouncement)
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
