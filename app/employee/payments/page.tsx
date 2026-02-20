'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, Plus, DollarSign, CheckCircle, Clock, XCircle, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

export default function EmployeePaymentsPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<any[]>([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewPayment, setShowNewPayment] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Stats calculées depuis les données
  const [stats, setStats] = useState({ totalAmount: 0, completed: 0, pending: 0, rejected: 0 })

  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    academicYearId: '',
    amount: '',
    paymentType: 'FRAIS_ACADEMIQUES',
    paymentMethod: 'CASH',
    reference: '',
    remarks: ''
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async (page = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/payments?page=${page}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
        setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 })
        
        // Calculer les stats depuis les données
        const all = data.payments || []
        const totalAmount = all
          .filter((p: any) => p.status === 'COMPLETED')
          .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0)
        const completed = all.filter((p: any) => p.status === 'COMPLETED').length
        const pending = all.filter((p: any) => p.status === 'PENDING').length
        const rejected = all.filter((p: any) => p.status === 'REJECTED' || p.status === 'CANCELLED').length
        setStats({ totalAmount, completed, pending, rejected })
      } else {
        toast.error('Erreur lors du chargement des paiements')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const createPayment = async () => {
    if (!paymentForm.studentId || !paymentForm.amount || !paymentForm.academicYearId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parseInt(paymentForm.studentId),
          academicYearId: parseInt(paymentForm.academicYearId),
          amount: parseFloat(paymentForm.amount),
          paymentType: paymentForm.paymentType,
          paymentMethod: paymentForm.paymentMethod,
          reference: paymentForm.reference || null,
          remarks: paymentForm.remarks || null,
          recordedBy: user?.userId
        })
      })
      if (response.ok) {
        toast.success('Paiement enregistré avec succès')
        setShowNewPayment(false)
        setPaymentForm({
          studentId: '', academicYearId: '', amount: '',
          paymentType: 'FRAIS_ACADEMIQUES', paymentMethod: 'CASH',
          reference: '', remarks: ''
        })
        fetchPayments()
      } else {
        const err = await response.json()
        toast.error(err.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredPayments = payments.filter(payment =>
    (payment.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.matricule || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.receipt_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.reference || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="h-3 w-3 mr-1" />Validé</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      case 'REJECTED':
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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
          <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enregistrer et valider les paiements des étudiants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchPayments()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => setShowNewPayment(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau paiement
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total reçu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{pagination.total} paiement(s) total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par référence, étudiant ou matricule..."
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
                <TableHead>N° Reçu</TableHead>
                <TableHead>Étudiant</TableHead>
                <TableHead>Matricule</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono">{payment.receipt_number || '-'}</TableCell>
                  <TableCell className="font-medium">{payment.student_name}</TableCell>
                  <TableCell>{payment.matricule}</TableCell>
                  <TableCell className="text-sm">{payment.payment_type?.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="font-bold text-green-600">${parseFloat(payment.amount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline">{payment.payment_method || '-'}</Badge></TableCell>
                  <TableCell>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Aucun paiement trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button 
                variant="outline" size="sm" 
                disabled={pagination.page <= 1}
                onClick={() => fetchPayments(pagination.page - 1)}
              >
                Précédent
              </Button>
              <span className="flex items-center text-sm text-gray-500">
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <Button 
                variant="outline" size="sm" 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchPayments(pagination.page + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog nouveau paiement */}
      <Dialog open={showNewPayment} onOpenChange={setShowNewPayment}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription>Saisir les informations du paiement étudiant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID Étudiant *</Label>
                <Input 
                  type="number" placeholder="Ex: 123"
                  value={paymentForm.studentId}
                  onChange={(e) => setPaymentForm({...paymentForm, studentId: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>ID Année académique *</Label>
                <Input 
                  type="number" placeholder="Ex: 1"
                  value={paymentForm.academicYearId}
                  onChange={(e) => setPaymentForm({...paymentForm, academicYearId: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Montant (USD) *</Label>
                <Input 
                  type="number" placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={paymentForm.paymentType} onValueChange={(v) => setPaymentForm({...paymentForm, paymentType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FRAIS_ACADEMIQUES">Frais académiques</SelectItem>
                    <SelectItem value="FRAIS_INSCRIPTION">Frais d&apos;inscription</SelectItem>
                    <SelectItem value="FRAIS_LABORATOIRE">Frais de laboratoire</SelectItem>
                    <SelectItem value="FRAIS_MINERVAL">Minerval</SelectItem>
                    <SelectItem value="AUTRE">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mode de paiement</Label>
                <Select value={paymentForm.paymentMethod} onValueChange={(v) => setPaymentForm({...paymentForm, paymentMethod: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Espèces</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Virement bancaire</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    <SelectItem value="CHECK">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Référence</Label>
                <Input 
                  placeholder="N° de référence"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Remarques</Label>
              <Input 
                placeholder="Notes supplémentaires"
                value={paymentForm.remarks}
                onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPayment(false)} disabled={submitting}>Annuler</Button>
            <Button onClick={createPayment} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi...</> : <><Plus className="h-4 w-4 mr-2" />Enregistrer</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
