'use client'

import { useState, useEffect } from 'react'
import { 
  FileText,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Printer,
  Send,
  AlertTriangle,
  Award,
  GraduationCap,
  CreditCard,
  Calendar,
  User,
  Building,
  FileCheck,
  History
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

interface DocumentRequest {
  id: string
  reference: string
  student_id: string
  student_name: string
  student_matricule: string
  promotion: string
  document_type: string
  purpose: string
  status: string
  requested_at: string
  processed_at?: string
  processed_by?: string
  document_url?: string
  rejection_reason?: string
  copies_count: number
  fee_amount: number
  is_paid: boolean
}

interface DocumentType {
  code: string
  name: string
  fee: number
  processing_days: number
  required_documents: string[]
}

const DOCUMENT_TYPES: DocumentType[] = [
  { 
    code: 'ATTESTATION_INSCRIPTION', 
    name: "Attestation d'inscription", 
    fee: 5000,
    processing_days: 3,
    required_documents: ['Carte d\'étudiant', 'Bordereau de paiement']
  },
  { 
    code: 'ATTESTATION_FREQUENTATION', 
    name: 'Attestation de fréquentation', 
    fee: 5000,
    processing_days: 3,
    required_documents: ['Carte d\'étudiant']
  },
  { 
    code: 'RELEVE_NOTES', 
    name: 'Relevé de notes', 
    fee: 10000,
    processing_days: 5,
    required_documents: ['Carte d\'étudiant', 'Bordereau de paiement']
  },
  { 
    code: 'ATTESTATION_REUSSITE', 
    name: 'Attestation de réussite', 
    fee: 15000,
    processing_days: 7,
    required_documents: ['PV de délibération']
  },
  { 
    code: 'DIPLOME', 
    name: 'Diplôme', 
    fee: 50000,
    processing_days: 30,
    required_documents: ['Attestation de réussite', 'Photos d\'identité', 'Copie acte de naissance']
  },
  { 
    code: 'ATTESTATION_STAGE', 
    name: 'Attestation de stage', 
    fee: 5000,
    processing_days: 5,
    required_documents: ['Lettre de demande', 'Convention de stage']
  },
  { 
    code: 'LETTRE_RECOMMANDATION', 
    name: 'Lettre de recommandation', 
    fee: 10000,
    processing_days: 7,
    required_documents: ['CV', 'Lettre de motivation']
  },
  { 
    code: 'CERTIFICAT_SCOLARITE', 
    name: 'Certificat de scolarité', 
    fee: 5000,
    processing_days: 3,
    required_documents: ['Carte d\'étudiant']
  }
]

export default function AdminDocumentsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    rejected: 0
  })

  useEffect(() => {
    fetchRequests()
  }, [activeTab, filterType])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/documents?status=${activeTab}&type=${filterType}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
        setStats(data.stats || { pending: 0, processing: 0, completed: 0, rejected: 0 })
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessRequest = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return

    if (action === 'reject' && !rejectionReason) {
      toast.error('Veuillez indiquer la raison du rejet')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          requestId: selectedRequest.id,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        })
      })

      if (response.ok) {
        toast.success(action === 'approve' ? 'Document approuvé' : 'Demande rejetée')
        setShowProcessDialog(false)
        setSelectedRequest(null)
        setRejectionReason('')
        fetchRequests()
      } else {
        toast.error('Erreur lors du traitement')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setProcessing(false)
    }
  }

  const handleGenerateDocument = async (request: DocumentRequest) => {
    toast.info('Génération du document en cours...')
    // En production, ceci générerait un PDF
    setTimeout(() => {
      toast.success('Document généré avec succès')
    }, 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700">En attente</Badge>
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-700">En traitement</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-700">Terminé</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700">Rejeté</Badge>
      case 'READY':
        return <Badge className="bg-purple-100 text-purple-700">Prêt à retirer</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'DIPLOME':
        return <GraduationCap className="h-5 w-5 text-amber-500" />
      case 'ATTESTATION_REUSSITE':
        return <Award className="h-5 w-5 text-green-500" />
      case 'RELEVE_NOTES':
        return <FileCheck className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0
    }).format(amt)
  }

  const filteredRequests = requests.filter(req =>
    req.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.student_matricule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Gestion des Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            Traitement des demandes de documents administratifs
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('pending')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('processing')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En traitement</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('completed')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terminés</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('rejected')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejetés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et Recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, matricule ou référence..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Type de document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchRequests}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">En attente ({stats.pending})</TabsTrigger>
          <TabsTrigger value="processing">En traitement ({stats.processing})</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
          <TabsTrigger value="rejected">Rejetés</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune demande dans cette catégorie</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Type de document</TableHead>
                    <TableHead>Date demande</TableHead>
                    <TableHead>Frais</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">
                        {request.reference}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.student_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.student_matricule} • {request.promotion}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDocumentIcon(request.document_type)}
                          <span>{DOCUMENT_TYPES.find(t => t.code === request.document_type)?.name || request.document_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.requested_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatAmount(request.fee_amount)}</p>
                          {request.is_paid ? (
                            <Badge variant="outline" className="text-green-600 text-xs">Payé</Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 text-xs">Non payé</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedRequest(request)
                              setShowPreviewDialog(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            
                            {request.status === 'PENDING' && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedRequest(request)
                                setShowProcessDialog(true)
                              }}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Traiter
                              </DropdownMenuItem>
                            )}

                            {request.status === 'COMPLETED' && (
                              <>
                                <DropdownMenuItem onClick={() => handleGenerateDocument(request)}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Générer PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Imprimer
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuItem>
                              <History className="h-4 w-4 mr-2" />
                              Historique
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Types de documents disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Types de documents disponibles</CardTitle>
          <CardDescription>Tarifs et délais de traitement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOCUMENT_TYPES.map((docType) => (
              <div key={docType.code} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h4 className="font-medium text-sm">{docType.name}</h4>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Frais: <span className="font-medium text-foreground">{formatAmount(docType.fee)}</span></p>
                  <p>Délai: <span className="font-medium text-foreground">{docType.processing_days} jours</span></p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Traiter */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traiter la demande</DialogTitle>
            <DialogDescription>
              {selectedRequest?.reference} - {selectedRequest?.student_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Document demandé</p>
                  <p className="font-medium">
                    {DOCUMENT_TYPES.find(t => t.code === selectedRequest?.document_type)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Motif</p>
                  <p className="font-medium">{selectedRequest?.purpose || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nombre de copies</p>
                  <p className="font-medium">{selectedRequest?.copies_count || 1}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paiement</p>
                  <p className="font-medium">
                    {selectedRequest?.is_paid ? (
                      <span className="text-green-600">Payé</span>
                    ) : (
                      <span className="text-red-600">Non payé</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {!selectedRequest?.is_paid && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    Les frais de {formatAmount(selectedRequest?.fee_amount || 0)} n'ont pas encore été payés
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Raison du rejet (si applicable)</Label>
              <Textarea
                placeholder="Indiquez la raison du rejet..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="destructive" 
              onClick={() => handleProcessRequest('reject')}
              disabled={processing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button 
              onClick={() => handleProcessRequest('approve')}
              disabled={processing || !selectedRequest?.is_paid}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Aperçu */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
            <DialogDescription>
              Référence: {selectedRequest?.reference}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations étudiant
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom complet</span>
                    <span className="font-medium">{selectedRequest?.student_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matricule</span>
                    <span className="font-medium">{selectedRequest?.student_matricule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Promotion</span>
                    <span className="font-medium">{selectedRequest?.promotion}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Informations document
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">
                      {DOCUMENT_TYPES.find(t => t.code === selectedRequest?.document_type)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Copies</span>
                    <span className="font-medium">{selectedRequest?.copies_count || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais</span>
                    <span className="font-medium">{formatAmount(selectedRequest?.fee_amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Motif de la demande</h4>
              <p className="text-sm text-muted-foreground">
                {selectedRequest?.purpose || 'Non spécifié'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Historique</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">
                    Demande créée le {new Date(selectedRequest?.requested_at || '').toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {selectedRequest?.processed_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">
                      Traitée le {new Date(selectedRequest.processed_at).toLocaleDateString('fr-FR')}
                      {selectedRequest.processed_by && ` par ${selectedRequest.processed_by}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selectedRequest?.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-1">Raison du rejet</h4>
                <p className="text-sm text-red-700">{selectedRequest.rejection_reason}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Fermer
            </Button>
            {selectedRequest?.status === 'COMPLETED' && (
              <Button onClick={() => handleGenerateDocument(selectedRequest!)}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
