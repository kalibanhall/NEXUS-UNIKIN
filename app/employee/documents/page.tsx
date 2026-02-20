'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Search, FileText, Eye, CheckCircle, Clock, XCircle, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

export default function EmployeeDocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<any[]>([])
  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0, rejected: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.requests || [])
        setStats(data.stats || { pending: 0, processing: 0, completed: 0, rejected: 0 })
      } else {
        toast.error('Erreur lors du chargement des documents')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const approveDocument = async (docId: number) => {
    setProcessing(true)
    try {
      const response = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          requestId: docId,
          processedBy: user?.userId
        })
      })
      if (response.ok) {
        toast.success('Document approuvé')
        fetchDocuments()
      } else {
        const err = await response.json()
        toast.error(err.error || 'Erreur')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setProcessing(false)
    }
  }

  const rejectDocument = async () => {
    if (!selectedDocId || !rejectionReason.trim()) {
      toast.error('Veuillez indiquer la raison du rejet')
      return
    }
    setProcessing(true)
    try {
      const response = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          requestId: selectedDocId,
          rejectionReason: rejectionReason.trim(),
          processedBy: user?.userId
        })
      })
      if (response.ok) {
        toast.success('Demande rejetée')
        setShowRejectDialog(false)
        setRejectionReason('')
        setSelectedDocId(null)
        fetchDocuments()
      } else {
        const err = await response.json()
        toast.error(err.error || 'Erreur')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setProcessing(false)
    }
  }

  const filteredDocuments = documents.filter(doc =>
    (doc.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.student_matricule || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.document_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.id?.toString().includes(searchTerm)
  )

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'APPROVED':
      case 'READY':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="h-3 w-3 mr-1" />Prêt</Badge>
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"><Clock className="h-3 w-3 mr-1" />En cours</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ATTESTATION_INSCRIPTION': 'Attestation d\'inscription',
      'ATTESTATION_FREQUENTATION': 'Attestation de fréquentation',
      'RELEVE_NOTES': 'Relevé de notes',
      'CERTIFICAT_SCOLARITE': 'Certificat de scolarité',
      'DIPLOME': 'Diplôme',
      'AUTRE': 'Autre'
    }
    return labels[type] || type
  }

  const totalRequests = parseInt(stats.pending?.toString() || '0') + 
                        parseInt(stats.processing?.toString() || '0') + 
                        parseInt(stats.completed?.toString() || '0') + 
                        parseInt(stats.rejected?.toString() || '0')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Documents</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Traiter les demandes de documents des étudiants
          </p>
        </div>
        <Button variant="outline" onClick={fetchDocuments}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demandes de documents</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par étudiant, matricule ou type..."
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
                <TableHead>ID</TableHead>
                <TableHead>Étudiant</TableHead>
                <TableHead>Matricule</TableHead>
                <TableHead>Type de document</TableHead>
                <TableHead>Copies</TableHead>
                <TableHead>Frais</TableHead>
                <TableHead>Date demande</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-mono">#{doc.id}</TableCell>
                  <TableCell className="font-medium">{doc.student_name}</TableCell>
                  <TableCell>{doc.student_matricule}</TableCell>
                  <TableCell>{getDocTypeLabel(doc.document_type)}</TableCell>
                  <TableCell className="text-center">{doc.copies_count || 1}</TableCell>
                  <TableCell>${doc.fee_amount || 0}</TableCell>
                  <TableCell>{doc.requested_at ? new Date(doc.requested_at).toLocaleDateString('fr-FR') : '-'}</TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {doc.status === 'PENDING' && (
                      <>
                        <Button 
                          variant="ghost" size="sm" className="text-green-600"
                          onClick={() => approveDocument(doc.id)}
                          disabled={processing}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="sm" className="text-red-600"
                          onClick={() => { setSelectedDocId(doc.id); setShowRejectDialog(true) }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {doc.status === 'PROCESSING' && (
                      <Button 
                        variant="ghost" size="sm" className="text-green-600"
                        onClick={() => approveDocument(doc.id)}
                        disabled={processing}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Aucune demande de document trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>Indiquez la raison du rejet de cette demande de document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Raison du rejet *</Label>
              <Textarea
                placeholder="Expliquez pourquoi cette demande est rejetée..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>Annuler</Button>
            <Button variant="destructive" onClick={rejectDocument} disabled={processing || !rejectionReason.trim()}>
              {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi...</> : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
