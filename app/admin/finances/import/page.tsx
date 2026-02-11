'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  ArrowLeft,
  FileUp,
  Table,
  Eye,
  Users,
  DollarSign,
  Trash2,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table as UITable,
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
import { toast } from 'sonner'
import Link from 'next/link'

const paymentTypeLabels: Record<string, string> = {
  INSCRIPTION: 'Inscription',
  FRAIS_ACADEMIQUES: 'Frais académiques',
  FRAIS_MINERVAL: 'Minerval',
  LABORATOIRE: 'Laboratoire',
  AUTRES: 'Autres',
}

interface PreviewRow {
  row: number
  matricule: string
  nom: string
  prenom: string
  montant: number
  type_paiement: string
  mode_paiement: string
  reference: string
  date: string
  found: boolean
  student_name: string | null
}

interface ImportSummary {
  total_lines: number
  total_amount: number
  students_found: number
  students_not_found: number
  detected_columns: { name: string; header: string }[]
}

interface ImportResult {
  imported: number
  skipped: number
  total: number
  errors: { row: number; matricule: string; error: string }[]
}

export default function FinanceImportPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'result'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [academicYearId, setAcademicYearId] = useState('1')
  const [dragActive, setDragActive] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sheetName, setSheetName] = useState('')
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([])
  const [totalRows, setTotalRows] = useState(0)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files?.[0]) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = async (selectedFile: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv']
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'))
    
    if (!validExtensions.includes(ext.toLowerCase())) {
      toast.error('Format non supporté. Utilisez un fichier Excel (.xlsx, .xls) ou CSV.')
      return
    }

    setFile(selectedFile)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('action', 'preview')
      formData.append('academicYearId', academicYearId)

      const response = await fetch('/api/finances/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la lecture du fichier')
        setFile(null)
        return
      }

      setPreview(data.preview)
      setSummary(data.summary)
      setSheetName(data.sheet_name)
      setDetectedHeaders(data.headers)
      setTotalRows(data.totalRows)
      setStep('preview')
    } catch (error) {
      toast.error('Erreur lors de la lecture du fichier')
      setFile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return
    setShowConfirmDialog(false)
    setStep('importing')
    setImportProgress(10)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('action', 'import')
      formData.append('academicYearId', academicYearId)

      // Simuler une progression
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 5, 90))
      }, 500)

      const response = await fetch('/api/finances/import', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de l\'importation')
        setStep('preview')
        return
      }

      setImportProgress(100)
      setImportResult(data.result)
      setStep('result')
      toast.success(`${data.result.imported} paiements importés avec succès`)
    } catch (error) {
      toast.error('Erreur lors de l\'importation')
      setStep('preview')
    }
  }

  const resetImport = () => {
    setStep('upload')
    setFile(null)
    setPreview([])
    setSummary(null)
    setImportResult(null)
    setImportProgress(0)
    setSheetName('')
    setDetectedHeaders([])
    setTotalRows(0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/finances">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-7 w-7 text-green-600" />
              Importation des donnees financieres
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Importez les paiements etudiants depuis un fichier Excel ou CSV
            </p>
          </div>
        </div>
      </div>

      {/* Étapes */}
      <div className="flex items-center gap-2">
        {[
          { id: 'upload', label: 'Fichier', icon: FileUp },
          { id: 'preview', label: 'Aperçu', icon: Eye },
          { id: 'importing', label: 'Import', icon: RefreshCw },
          { id: 'result', label: 'Résultat', icon: CheckCircle },
        ].map((s, idx) => {
          const isActive = s.id === step
          const isDone = ['upload', 'preview', 'importing', 'result'].indexOf(step) > idx
          const Icon = s.icon
          return (
            <div key={s.id} className="flex items-center gap-2">
              {idx > 0 && <div className={`w-8 h-0.5 ${isDone || isActive ? 'bg-green-500' : 'bg-gray-300'}`} />}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                isDone ? 'bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-500' :
                'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Étape 1: Upload */}
      {step === 'upload' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Charger un fichier
                </CardTitle>
                <CardDescription>
                  Glissez-deposez ou selectionnez un fichier Excel contenant les donnees de paiement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Annee academique</Label>
                    <Select value={academicYearId} onValueChange={setAcademicYearId}>
                      <SelectTrigger className="w-full sm:w-[250px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">2025-2026</SelectItem>
                        <SelectItem value="2">2024-2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div
                    className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                      dragActive 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                    
                    {loading ? (
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="h-12 w-12 text-green-500 animate-spin" />
                        <p className="text-gray-600 dark:text-gray-300">Analyse du fichier en cours...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                          <FileSpreadsheet className="h-12 w-12 text-green-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                            Glissez votre fichier ici
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            ou cliquez pour selectionner un fichier
                          </p>
                        </div>
                        <Button onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Selectionner un fichier
                        </Button>
                        <p className="text-xs text-gray-400">
                          Formats acceptes: Excel (.xlsx, .xls), CSV (.csv) - Taille max: 10 Mo
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Format attendu
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p className="text-gray-600 dark:text-gray-400">
                  Le fichier doit contenir les colonnes suivantes :
                </p>
                <ul className="space-y-2">
                  {[
                    { name: 'Matricule', required: true, desc: 'Identifiant etudiant' },
                    { name: 'Montant', required: true, desc: 'Montant en USD' },
                    { name: 'Nom', required: false, desc: 'Nom de famille' },
                    { name: 'Prenom', required: false, desc: 'Prenom' },
                    { name: 'Type', required: false, desc: 'Type de paiement' },
                    { name: 'Mode', required: false, desc: 'Mode de paiement' },
                    { name: 'Reference', required: false, desc: 'N° transaction' },
                    { name: 'Date', required: false, desc: 'Date du paiement' },
                  ].map((col) => (
                    <li key={col.name} className="flex items-start gap-2">
                      {col.required ? (
                        <Badge variant="destructive" className="text-[10px] px-1.5 mt-0.5">Requis</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-1.5 mt-0.5">Optionnel</Badge>
                      )}
                      <div>
                        <span className="font-medium">{col.name}</span>
                        <span className="text-gray-400 ml-1">- {col.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Modele
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-3">
                  Telechargez un modele de fichier avec les bonnes colonnes
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => {
                  // Générer un fichier modèle simple
                  const headers = ['Matricule', 'Nom', 'Prenom', 'Montant', 'Type', 'Mode', 'Reference', 'Date']
                  const sample = ['L1-INFO-2025-001', 'Mbuyi', 'Patrick', '250', 'Frais académiques', 'Mobile Money', 'TX-001', '11/02/2026']
                  const csv = [headers.join(';'), sample.join(';')].join('\n')
                  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'modele_import_finances.csv'
                  a.click()
                  URL.revokeObjectURL(url)
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Telecharger le modele
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Étape 2: Preview */}
      {step === 'preview' && summary && (
        <div className="space-y-6">
          {/* Résumé */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Lignes detectees</p>
                    <p className="text-2xl font-bold">{totalRows}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Table className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Montant total</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${summary.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Etudiants trouves</p>
                    <p className="text-2xl font-bold text-green-600">{summary.students_found}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Non trouves</p>
                    <p className="text-2xl font-bold text-red-600">{summary.students_not_found}</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info fichier */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  {file?.name} - Feuille: {sheetName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {summary.detected_columns.length} colonnes detectees
                  </Badge>
                </div>
              </div>
              {summary.detected_columns.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {summary.detected_columns.map((col) => (
                    <Badge key={col.name} variant="secondary" className="text-xs">
                      {col.name}: &quot;{col.header}&quot;
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Table de prévisualisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Apercu des donnees ({preview.length} sur {totalRows} lignes)
              </CardTitle>
              <CardDescription>
                Verifiez les donnees avant de lancer l&apos;importation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <UITable>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Etudiant</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, idx) => (
                      <TableRow key={idx} className={!row.found ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                        <TableCell className="text-gray-400 text-xs">{row.row}</TableCell>
                        <TableCell>
                          {row.found ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{row.matricule}</TableCell>
                        <TableCell>
                          {row.found ? (
                            <span className="text-sm">{row.student_name}</span>
                          ) : (
                            <span className="text-sm text-red-500">
                              {row.nom || row.prenom ? `${row.prenom} ${row.nom}` : 'Non trouve'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            ${row.montant.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {paymentTypeLabels[row.type_paiement] || row.type_paiement}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{row.mode_paiement}</TableCell>
                        <TableCell className="text-sm text-gray-500">{row.reference || '-'}</TableCell>
                        <TableCell className="text-sm">{row.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </UITable>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
              <Button variant="outline" onClick={resetImport}>
                <Trash2 className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <div className="flex items-center gap-3">
                {summary.students_not_found > 0 && (
                  <p className="text-sm text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {summary.students_not_found} etudiant(s) non trouves seront ignores
                  </p>
                )}
                <Button onClick={() => setShowConfirmDialog(true)} disabled={summary.students_found === 0}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Importer {summary.students_found} paiement(s)
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Étape 3: Import en cours */}
      {step === 'importing' && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-6">
              <RefreshCw className="h-16 w-16 text-green-500 animate-spin" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Importation en cours...
                </h3>
                <p className="text-gray-500 mt-1">
                  Veuillez patienter, les paiements sont en cours d&apos;enregistrement
                </p>
              </div>
              <div className="w-full max-w-md">
                <Progress value={importProgress} className="h-3" />
                <p className="text-sm text-gray-400 mt-2">{importProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 4: Résultat */}
      {step === 'result' && importResult && (
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Importation terminee
                </h3>
                <p className="text-gray-500 max-w-md">
                  Les donnees financieres ont ete importees et la situation des etudiants a ete mise a jour.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Paiements importes</p>
                    <p className="text-3xl font-bold text-green-600">{importResult.imported}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="text-sm text-gray-500">Lignes ignorees</p>
                    <p className="text-3xl font-bold text-amber-600">{importResult.skipped}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Table className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Total traite</p>
                    <p className="text-3xl font-bold">{importResult.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Erreurs */}
          {importResult.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  Lignes ignorees ({importResult.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <UITable>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ligne</TableHead>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Raison</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResult.errors.map((err, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{err.row}</TableCell>
                        <TableCell className="font-mono">{err.matricule}</TableCell>
                        <TableCell className="text-red-500">{err.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </UITable>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={resetImport}>
              <Upload className="h-4 w-4 mr-2" />
              Nouvel import
            </Button>
            <Link href="/admin/finances">
              <Button>
                <ArrowRight className="h-4 w-4 mr-2" />
                Voir les finances
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Dialog de confirmation */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmer l&apos;importation
            </DialogTitle>
            <DialogDescription>
              Vous etes sur le point d&apos;importer {summary?.students_found || 0} paiements 
              pour un montant total de ${summary?.total_amount.toLocaleString() || 0}.
              {summary && summary.students_not_found > 0 && (
                <span className="block mt-2 text-amber-600">
                  {summary.students_not_found} ligne(s) seront ignorees car les matricules 
                  n&apos;ont pas ete trouves dans le systeme.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleImport}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer l&apos;import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
