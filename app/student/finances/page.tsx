'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Wallet, Download, RefreshCw, AlertTriangle, CheckCircle, 
  Upload, FileText, CreditCard, GraduationCap, FlaskConical,
  Receipt, Plus, Eye, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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

export default function StudentFinancesPage() {
  const { user } = useAuth()
  const studentInfo = user?.profile
  const [data, setData] = useState<any>(null)
  const [finances, setFinances] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [receiptForm, setReceiptForm] = useState({
    receiptType: 'BORDEREAU',
    receiptNumber: '',
    bankName: '',
    bankReference: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    if (user?.userId) {
      fetchData()
    }
  }, [user?.userId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard?role=STUDENT&user_id=${user?.userId}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
      if (studentInfo?.id) {
        const finResponse = await fetch(`/api/student-finances?student_id=${studentInfo.id}`)
        if (finResponse.ok) {
          const finResult = await finResponse.json()
          setFinances(finResult)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 5 Mo')
        return
      }
      setSelectedFile(file)
    }
  }

  const submitReceipt = async () => {
    if (!receiptForm.receiptNumber || !receiptForm.amount || !receiptForm.paymentDate) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    setSubmitting(true)
    try {
      let scanUrl = null
      if (selectedFile) {
        scanUrl = `/uploads/${selectedFile.name}`
      }
      const response = await fetch('/api/student-finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentInfo?.id,
          ...receiptForm,
          amount: parseFloat(receiptForm.amount),
          scanUrl
        })
      })
      if (response.ok) {
        toast.success('Bordereau enregistré avec succès')
        setShowReceiptDialog(false)
        setReceiptForm({
          receiptType: 'BORDEREAU', receiptNumber: '', bankName: '', bankReference: '',
          amount: '', paymentDate: new Date().toISOString().split('T')[0], notes: ''
        })
        setSelectedFile(null)
        fetchData()
      } else {
        toast.error('Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  const totalFees = finances?.summary?.totalDue || 1300
  const totalPaid = finances?.summary?.totalPaid || data?.totalPaid || 0
  const remaining = totalFees - totalPaid
  const percentage = Math.min(100, Math.round((totalPaid / totalFees) * 100))

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
          <h1 className="text-3xl font-bold">Finances</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestion de vos frais académiques et paiements</p>
        </div>
        <Button onClick={() => setShowReceiptDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un bordereau
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total frais</p>
                <p className="text-3xl font-bold">${totalFees.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total payé</p>
                <p className="text-3xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Reste à payer</p>
                <p className="text-3xl font-bold text-amber-600">${remaining.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Progression des paiements</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Avancement</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-4" />
            <p className="text-sm text-gray-500 mt-2">
              {data?.student?.payment_status === 'PAID' 
                ? '✅ Votre situation financière est régularisée' 
                : `Il vous reste $${remaining.toLocaleString()} à payer.`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payments">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="receipts">Bordereaux</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>N° Reçu</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.payments?.length > 0 ? data.payments.map((payment: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="font-mono">{payment.receipt_number}</TableCell>
                      <TableCell>{payment.payment_type}</TableCell>
                      <TableCell><Badge variant="outline">{payment.payment_method}</Badge></TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        ${parseFloat(payment.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Aucun paiement enregistré
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bordereaux et Reçus</CardTitle>
                <Button onClick={() => setShowReceiptDialog(true)} size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />Nouveau
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>N° Référence</TableHead>
                    <TableHead>Banque</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finances?.receipts?.length > 0 ? finances.receipts.map((receipt: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(receipt.payment_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell><Badge variant="outline">{receipt.receipt_type}</Badge></TableCell>
                      <TableCell className="font-mono">{receipt.receipt_number}</TableCell>
                      <TableCell>{receipt.bank_name || '-'}</TableCell>
                      <TableCell className="text-right font-bold">${parseFloat(receipt.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {receipt.verified ? <Badge className="bg-green-600">Vérifié</Badge> : <Badge className="bg-amber-600">En attente</Badge>}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">Aucun bordereau</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />Enregistrer un bordereau</DialogTitle>
            <DialogDescription>Soumettez votre preuve de paiement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={receiptForm.receiptType} onValueChange={(v) => setReceiptForm({...receiptForm, receiptType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BORDEREAU">Bordereau bancaire</SelectItem>
                    <SelectItem value="RECU">Reçu de paiement</SelectItem>
                    <SelectItem value="FACTURE">Facture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>N° Référence *</Label>
                <Input placeholder="Ex: BRD-2026-001" value={receiptForm.receiptNumber} onChange={(e) => setReceiptForm({...receiptForm, receiptNumber: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banque</Label>
                <Select value={receiptForm.bankName} onValueChange={(v) => setReceiptForm({...receiptForm, bankName: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RawBank">RawBank</SelectItem>
                    <SelectItem value="Equity BCDC">Equity BCDC</SelectItem>
                    <SelectItem value="TMB">Trust Merchant Bank</SelectItem>
                    <SelectItem value="Ecobank">Ecobank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Montant (USD) *</Label>
                <Input type="number" placeholder="0.00" value={receiptForm.amount} onChange={(e) => setReceiptForm({...receiptForm, amount: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date de paiement *</Label>
              <Input type="date" value={receiptForm.paymentDate} onChange={(e) => setReceiptForm({...receiptForm, paymentDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Photo/Scan du document</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary" onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-green-600" />
                    <span>{selectedFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Cliquez pour sélectionner</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)} disabled={submitting}>Annuler</Button>
            <Button onClick={submitReceipt} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi...</> : <><Upload className="h-4 w-4 mr-2" />Soumettre</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
