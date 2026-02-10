'use client'

import { useState, useEffect } from 'react'
import { 
  Smartphone,
  CreditCard,
  Wallet,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  RefreshCw,
  Phone,
  Shield,
  Info,
  History
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

interface PaymentMethod {
  id: string
  name: string
  code: string
  logo: string
  ussdCode: string
  instructions: string[]
  fee_percentage: number
}

interface Transaction {
  id: string
  reference: string
  amount: number
  fee: number
  provider: string
  phone_number: string
  status: string
  created_at: string
  completed_at?: string
  description: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'airtel',
    name: 'Airtel Money',
    code: 'AIRTEL_MONEY',
    logo: '/images/airtel-money.png',
    ussdCode: '*144#',
    instructions: [
      'Composez *144# sur votre téléphone',
      'Sélectionnez "Paiement marchand"',
      'Entrez le code marchand: NEXUS001',
      'Entrez le montant',
      'Confirmez avec votre code PIN'
    ],
    fee_percentage: 1.5
  },
  {
    id: 'mpesa',
    name: 'M-Pesa',
    code: 'MPESA',
    logo: '/images/mpesa.png',
    ussdCode: '*151#',
    instructions: [
      'Composez *151# sur votre téléphone',
      'Sélectionnez "Payer"',
      'Entrez le numéro d\'entreprise: 123456',
      'Entrez la référence de paiement',
      'Entrez le montant et confirmez'
    ],
    fee_percentage: 1.8
  },
  {
    id: 'orange',
    name: 'Orange Money',
    code: 'ORANGE_MONEY',
    logo: '/images/orange-money.png',
    ussdCode: '*144*1#',
    instructions: [
      'Composez *144*1# sur votre téléphone',
      'Sélectionnez "Paiement marchand"',
      'Entrez le code marchand',
      'Entrez le montant',
      'Confirmez avec votre code secret'
    ],
    fee_percentage: 1.5
  }
]

export default function MobilePaymentPage() {
  const { user } = useAuth()
  const studentInfo = user?.profile
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pendingPayment, setPendingPayment] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED'>('PENDING')
  const [balance, setBalance] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('pay')

  useEffect(() => {
    fetchTransactions()
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    if (!studentInfo?.id) return
    try {
      const response = await fetch(`/api/student-finances?student_id=${studentInfo.id}`)
      if (response.ok) {
        const data = await response.json()
        setBalance(data)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true)
      const response = await fetch('/api/mobile-payments?action=my_transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method)
  }

  const calculateFee = (amt: number) => {
    if (!selectedMethod) return 0
    return Math.round(amt * (selectedMethod.fee_percentage / 100))
  }

  const handleInitiatePayment = async () => {
    if (!selectedMethod || !amount || !phoneNumber) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount < 1000) {
      toast.error('Le montant minimum est de 1000 CDF')
      return
    }

    // Valider le numéro de téléphone
    const phoneRegex = /^(\+243|0)?(8[1-9]|9[0-9])[0-9]{7}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      toast.error('Numéro de téléphone invalide')
      return
    }

    setShowConfirmDialog(true)
  }

  const handleConfirmPayment = async () => {
    setLoading(true)
    setShowConfirmDialog(false)

    try {
      const response = await fetch('/api/mobile-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate',
          provider: selectedMethod?.code,
          amount: parseFloat(amount),
          phone_number: phoneNumber,
          description: 'Paiement frais académiques',
          student_id: studentInfo?.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPendingPayment(data)
        setPaymentStatus('PENDING')
        setShowStatusDialog(true)
        toast.success('Paiement initié! Suivez les instructions.')
        
        // Démarrer la vérification périodique
        startStatusCheck(data.reference)
      } else {
        toast.error(data.error || 'Erreur lors de l\'initiation du paiement')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const startStatusCheck = (reference: string) => {
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/mobile-payments?action=status&reference=${reference}`)
        const data = await response.json()

        if (data.status === 'SUCCESS') {
          setPaymentStatus('SUCCESS')
          toast.success('Paiement confirmé avec succès!')
          fetchTransactions()
          fetchBalance()
          return
        }

        if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          setPaymentStatus('FAILED')
          toast.error('Le paiement a échoué')
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000) // Vérifier toutes les 5 secondes
        }
      } catch (error) {
        console.error('Error checking status:', error)
      }
    }

    checkStatus()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papiers')
  }

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0
    }).format(amt)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-700">Confirmé</Badge>
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700">En attente</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-700">Échoué</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">Annulé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Smartphone className="h-8 w-8 text-primary" />
          Paiement Mobile Money
        </h1>
        <p className="text-muted-foreground mt-1">
          Payez vos frais académiques via Mobile Money
        </p>
      </div>

      {/* Solde actuel */}
      {balance && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde restant à payer</p>
                <p className="text-3xl font-bold text-primary">
                  {formatAmount(balance.remaining_balance || 0)}
                </p>
              </div>
              <Wallet className="h-12 w-12 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pay">Effectuer un paiement</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="pay" className="space-y-6 mt-6">
          {/* Sélection du mode de paiement */}
          <Card>
            <CardHeader>
              <CardTitle>1. Choisissez votre opérateur</CardTitle>
              <CardDescription>
                Sélectionnez le service de paiement mobile que vous souhaitez utiliser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PAYMENT_METHODS.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedMethod?.id === method.id 
                        ? 'border-2 border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectMethod(method)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        {method.id === 'airtel' && (
                          <div className="text-2xl font-bold text-red-500">A</div>
                        )}
                        {method.id === 'mpesa' && (
                          <div className="text-2xl font-bold text-green-500">M</div>
                        )}
                        {method.id === 'orange' && (
                          <div className="text-2xl font-bold text-orange-500">O</div>
                        )}
                      </div>
                      <h3 className="font-semibold">{method.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Frais: {method.fee_percentage}%
                      </p>
                      {selectedMethod?.id === method.id && (
                        <CheckCircle className="h-5 w-5 text-primary mx-auto mt-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de paiement */}
          {selectedMethod && (
            <Card>
              <CardHeader>
                <CardTitle>2. Détails du paiement</CardTitle>
                <CardDescription>
                  Entrez le montant et votre numéro {selectedMethod.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant (CDF)</Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Ex: 50000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-12"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        CDF
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Minimum: 1,000 CDF</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Ex: 081 234 5678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Format: 08X XXX XXXX ou +243 8X XXX XXXX
                    </p>
                  </div>
                </div>

                {amount && parseFloat(amount) >= 1000 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Récapitulatif</AlertTitle>
                    <AlertDescription>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Montant</p>
                          <p className="font-medium">{formatAmount(parseFloat(amount))}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Frais ({selectedMethod.fee_percentage}%)</p>
                          <p className="font-medium">{formatAmount(calculateFee(parseFloat(amount)))}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-semibold text-primary">
                            {formatAmount(parseFloat(amount) + calculateFee(parseFloat(amount)))}
                          </p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleInitiatePayment}
                  disabled={loading || !amount || !phoneNumber}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      Payer avec {selectedMethod.name}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Instructions */}
          {selectedMethod && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Instructions {selectedMethod.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Code USSD</p>
                    <p className="text-2xl font-bold">{selectedMethod.ussdCode}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedMethod.ussdCode)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                </div>
                <ol className="space-y-2">
                  {selectedMethod.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique des paiements
              </CardTitle>
              <CardDescription>
                Liste de tous vos paiements mobile money
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune transaction pour le moment</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Opérateur</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {tx.reference}
                        </TableCell>
                        <TableCell>{tx.provider}</TableCell>
                        <TableCell>{tx.phone_number}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatAmount(tx.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmation */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le paiement</DialogTitle>
            <DialogDescription>
              Vérifiez les détails avant de confirmer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opérateur</span>
                <span className="font-medium">{selectedMethod?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Numéro</span>
                <span className="font-medium">{phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-medium">{formatAmount(parseFloat(amount) || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frais</span>
                <span className="font-medium">{formatAmount(calculateFee(parseFloat(amount) || 0))}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">
                  {formatAmount((parseFloat(amount) || 0) + calculateFee(parseFloat(amount) || 0))}
                </span>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Sécurisé</AlertTitle>
              <AlertDescription>
                Vous recevrez une notification sur votre téléphone pour confirmer le paiement.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmPayment} disabled={loading}>
              {loading ? 'Traitement...' : 'Confirmer le paiement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de statut */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>
              {paymentStatus === 'PENDING' && 'Paiement en cours'}
              {paymentStatus === 'SUCCESS' && 'Paiement réussi!'}
              {paymentStatus === 'FAILED' && 'Paiement échoué'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">
            {paymentStatus === 'PENDING' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
                </div>
                <p className="text-muted-foreground mb-4">
                  En attente de confirmation sur votre téléphone...
                </p>
                <p className="text-sm text-muted-foreground">
                  Référence: <span className="font-mono font-medium">{pendingPayment?.reference}</span>
                </p>
              </>
            )}

            {paymentStatus === 'SUCCESS' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-green-600 mb-2">
                  Paiement confirmé!
                </p>
                <p className="text-muted-foreground">
                  Votre paiement a été enregistré avec succès.
                </p>
              </>
            )}

            {paymentStatus === 'FAILED' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-lg font-medium text-red-600 mb-2">
                  Le paiement a échoué
                </p>
                <p className="text-muted-foreground">
                  Veuillez réessayer ou contacter le support.
                </p>
              </>
            )}
          </div>

          <DialogFooter className="justify-center">
            <Button onClick={() => {
              setShowStatusDialog(false)
              if (paymentStatus === 'SUCCESS') {
                setAmount('')
                setPhoneNumber('')
                setSelectedMethod(null)
              }
            }}>
              {paymentStatus === 'SUCCESS' ? 'Fermer' : 'Compris'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
