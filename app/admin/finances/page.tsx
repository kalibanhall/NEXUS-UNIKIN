'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CreditCard, 
  Plus, 
  Search, 
  Download,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  Receipt,
  Printer,
  FileSpreadsheet,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Payment {
  id: number
  student_name: string
  matricule: string
  amount: number
  payment_type: string
  payment_method: string
  receipt_number: string
  status: string
  payment_date: string
  academic_year: string
}

const paymentTypeLabels: Record<string, string> = {
  INSCRIPTION: 'Frais d\'inscription',
  FRAIS_ACADEMIQUES: 'Frais académiques',
  FRAIS_MINERVAL: 'Minerval',
  LABORATOIRE: 'Frais de laboratoire',
  AUTRES: 'Autres frais',
}

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Espèces',
  BANK: 'Virement bancaire',
  MOBILE_MONEY: 'Mobile Money',
  CHECK: 'Chèque',
}

export default function FinancesPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showNewPaymentDialog, setShowNewPaymentDialog] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [newPayment, setNewPayment] = useState({
    studentId: '',
    amount: '',
    paymentType: 'FRAIS_ACADEMIQUES',
    paymentMethod: 'CASH',
    reference: '',
    remarks: '',
  })

  useEffect(() => {
    fetchPayments()
    fetchStudents()
    fetchStats()
  }, [typeFilter, search])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '20' })
      if (typeFilter && typeFilter !== 'all') params.append('payment_type', typeFilter)

      const response = await fetch(`/api/payments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard?role=SUPER_ADMIN')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleCreatePayment = async () => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parseInt(newPayment.studentId),
          academicYearId: 1, // Current year
          amount: parseFloat(newPayment.amount),
          paymentType: newPayment.paymentType,
          paymentMethod: newPayment.paymentMethod,
          reference: newPayment.reference,
          remarks: newPayment.remarks,
        })
      })

      if (response.ok) {
        setShowNewPaymentDialog(false)
        setNewPayment({
          studentId: '',
          amount: '',
          paymentType: 'FRAIS_ACADEMIQUES',
          paymentMethod: 'CASH',
          reference: '',
          remarks: '',
        })
        fetchPayments()
        fetchStats()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Error creating payment:', error)
    }
  }

  const totalCollected = payments.reduce((sum, p) => sum + parseFloat(String(p.amount)), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion financière</h1>
          <p className="text-gray-500 dark:text-gray-400">Suivi des paiements et frais académiques</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/finances/import">
            <Button variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Importer Excel
            </Button>
          </Link>
          <Dialog open={showNewPaymentDialog} onOpenChange={setShowNewPaymentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau paiement
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enregistrer un paiement</DialogTitle>
              <DialogDescription>
                Enregistrer un nouveau paiement étudiant
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Étudiant</Label>
                <Select value={newPayment.studentId} onValueChange={(v) => setNewPayment({...newPayment, studentId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un étudiant" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student: any) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {student.first_name} {student.last_name} ({student.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Montant (USD)</Label>
                <Input 
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de paiement</Label>
                  <Select value={newPayment.paymentType} onValueChange={(v) => setNewPayment({...newPayment, paymentType: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(paymentTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mode de paiement</Label>
                  <Select value={newPayment.paymentMethod} onValueChange={(v) => setNewPayment({...newPayment, paymentMethod: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(paymentMethodLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Référence (optionnel)</Label>
                <Input 
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                  placeholder="Numéro de transaction"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewPaymentDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreatePayment} disabled={!newPayment.studentId || !newPayment.amount}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total collecté</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats?.totalRevenue?.toLocaleString() || totalCollected.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Étudiants soldés</p>
                <p className="text-2xl font-bold">{stats?.paymentStats?.paid || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paiements partiels</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.paymentStats?.partial || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Impayés</p>
                <p className="text-2xl font-bold text-red-600">{stats?.paymentStats?.unpaid || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher par nom ou matricule..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(paymentTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <CardDescription>Liste de toutes les transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reçu</TableHead>
                <TableHead>Étudiant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Aucun paiement trouvé
                  </TableCell>
                </TableRow>
              ) : payments.map((payment) => (
                <TableRow key={payment.id} className="table-row-hover">
                  <TableCell>
                    <span className="font-mono text-sm">{payment.receipt_number}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.student_name}</p>
                      <p className="text-sm text-gray-500">{payment.matricule}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {paymentTypeLabels[payment.payment_type] || payment.payment_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      ${parseFloat(String(payment.amount)).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                  </TableCell>
                  <TableCell>
                    {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {payment.status === 'COMPLETED' ? 'Complété' : payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
