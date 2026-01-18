'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, Download, Eye, Plus, Clock, CheckCircle, 
  XCircle, Loader2, RefreshCw, TrendingUp, FileCheck,
  FileClock, FileX, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

interface DocumentRequest {
  id: string
  document_type: string
  status: string
  request_date: string
  ready_date?: string
  notes?: string
  rejection_reason?: string
}

interface DocumentStats {
  total: number
  pending: number
  processing: number
  ready: number
  delivered: number
  rejected: number
}

const DOCUMENT_TYPES = [
  { value: 'ATTESTATION_INSCRIPTION', label: 'Attestation d\'inscription', price: 10 },
  { value: 'ATTESTATION_REUSSITE', label: 'Attestation de réussite', price: 15 },
  { value: 'RELEVE_NOTES', label: 'Relevé de notes', price: 20 },
  { value: 'CERTIFICAT_SCOLARITE', label: 'Certificat de scolarité', price: 10 },
  { value: 'LETTRE_RECOMMANDATION', label: 'Lettre de recommandation', price: 25 },
  { value: 'DIPLOME_COPIE', label: 'Copie de diplôme', price: 50 },
  { value: 'BULLETIN', label: 'Bulletin', price: 15 },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-800', icon: FileClock },
  PROCESSING: { label: 'En traitement', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
  READY: { label: 'Prêt', color: 'bg-green-100 text-green-800', icon: FileCheck },
  DELIVERED: { label: 'Délivré', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  REJECTED: { label: 'Rejeté', color: 'bg-red-100 text-red-800', icon: FileX },
}

export default function StudentDocumentsPage() {
  const { user, studentInfo } = useAuth()
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [notes, setNotes] = useState('')
  const [copies, setCopies] = useState('1')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (studentInfo?.id) {
      fetchDocuments()
    }
  }, [studentInfo?.id])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/documents?student_id=${studentInfo?.id}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
        setStats(data.stats || { total: 0, pending: 0, processing: 0, ready: 0, delivered: 0, rejected: 0 })
      }
    } catch (error) {
      console.error('Error:', error)
      // Données de démonstration
      setStats({ total: 5, pending: 2, processing: 1, ready: 1, delivered: 1, rejected: 0 })
      setRequests([
        { id: '1', document_type: 'ATTESTATION_INSCRIPTION', status: 'READY', request_date: '2026-01-10', ready_date: '2026-01-12' },
        { id: '2', document_type: 'RELEVE_NOTES', status: 'PROCESSING', request_date: '2026-01-14' },
        { id: '3', document_type: 'CERTIFICAT_SCOLARITE', status: 'PENDING', request_date: '2026-01-15' },
        { id: '4', document_type: 'BULLETIN', status: 'DELIVERED', request_date: '2026-01-05', ready_date: '2026-01-08' },
        { id: '5', document_type: 'ATTESTATION_REUSSITE', status: 'PENDING', request_date: '2026-01-16' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const submitRequest = async () => {
    if (!selectedType) {
      toast.error('Veuillez sélectionner un type de document')
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentInfo?.id,
          documentType: selectedType,
          copies: parseInt(copies),
          notes
        })
      })
      if (response.ok) {
        toast.success('Demande enregistrée avec succès')
        setShowRequestDialog(false)
        setSelectedType('')
        setNotes('')
        setCopies('1')
        fetchDocuments()
      } else {
        toast.error('Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  const getDocumentLabel = (type: string) => {
    return DOCUMENT_TYPES.find(d => d.value === type)?.label || type
  }

  const getDocumentPrice = (type: string) => {
    return DOCUMENT_TYPES.find(d => d.value === type)?.price || 0
  }

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-gray-500 dark:text-gray-400">Demande et suivi de vos documents académiques</p>
        </div>
        <Button onClick={() => setShowRequestDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle demande
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total demandes</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats?.total || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">En attente</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{stats?.pending || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                <FileClock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">En traitement</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats?.processing || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Prêts</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats?.ready || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Délivrés</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{stats?.delivered || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des demandes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mes demandes</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="PROCESSING">En traitement</SelectItem>
                <SelectItem value="READY">Prêts</SelectItem>
                <SelectItem value="DELIVERED">Délivrés</SelectItem>
                <SelectItem value="REJECTED">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Date demande</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date prêt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? filteredRequests.map((request) => {
                const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.PENDING
                const StatusIcon = statusConfig.icon
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{getDocumentLabel(request.document_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(request.request_date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.color} gap-1`}>
                        <StatusIcon className={`h-3 w-3 ${request.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.ready_date 
                        ? new Date(request.ready_date).toLocaleDateString('fr-FR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" title="Voir détails">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'READY' && (
                          <Button variant="ghost" size="sm" title="Télécharger">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    Aucune demande de document
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog nouvelle demande */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Nouvelle demande de document
            </DialogTitle>
            <DialogDescription>
              Sélectionnez le type de document et précisez vos besoins
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type de document *</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un document" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(doc => (
                    <SelectItem key={doc.value} value={doc.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{doc.label}</span>
                        <Badge variant="outline" className="ml-2">${doc.price}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre d'exemplaires</Label>
              <Select value={copies} onValueChange={setCopies}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 exemplaire</SelectItem>
                  <SelectItem value="2">2 exemplaires</SelectItem>
                  <SelectItem value="3">3 exemplaires</SelectItem>
                  <SelectItem value="5">5 exemplaires</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes / Précisions</Label>
              <Input 
                placeholder="Ex: Pour dossier de bourse, urgent..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {selectedType && (
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 dark:text-blue-400">Coût estimé:</span>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    ${getDocumentPrice(selectedType) * parseInt(copies)}
                  </span>
                </div>
                <p className="text-xs text-blue-500 mt-1">
                  Délai de traitement: 3-5 jours ouvrables
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button onClick={submitRequest} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi...</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" />Soumettre</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
