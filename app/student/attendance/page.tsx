'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, RefreshCw, Calendar, KeyRound, Send, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

export default function StudentAttendancePage() {
  const { user, studentInfo } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCodeDialog, setShowCodeDialog] = useState(false)
  const [attendanceCode, setAttendanceCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchAttendance()
    }
  }, [user?.id])

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/dashboard?role=STUDENT&user_id=${user?.id}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitAttendanceCode = async () => {
    if (!attendanceCode.trim()) {
      toast.error('Veuillez entrer le code de présence')
      return
    }

    if (!studentInfo?.id) {
      toast.error('Information étudiant non disponible')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/attendance-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: attendanceCode.toUpperCase(),
          studentId: studentInfo.id,
          deviceInfo: navigator.userAgent
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Présence enregistrée pour ${result.courseName}`)
        setShowCodeDialog(false)
        setAttendanceCode('')
        fetchAttendance()
      } else {
        toast.error(result.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  const attendance = data?.attendance || { present: 0, absent: 0, late: 0, total: 0 }
  const rate = attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : 0

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
          <h1 className="text-3xl font-bold">Mes présences</h1>
          <p className="text-gray-500 dark:text-gray-400">Suivi de votre assiduité aux cours</p>
        </div>
        <Button onClick={() => setShowCodeDialog(true)} className="gap-2">
          <KeyRound className="h-4 w-4" />
          Entrer un code
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Taux de présence</p>
                <p className="text-3xl font-bold">{rate}%</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Présent</p>
                <p className="text-3xl font-bold text-green-600">{attendance.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-3xl font-bold text-red-600">{attendance.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En retard</p>
                <p className="text-3xl font-bold text-amber-600">{attendance.late}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <KeyRound className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-semibold">Valider votre présence</h3>
              <p className="text-sm text-gray-500">
                Entrez le code à 6 caractères communiqué par votre enseignant pour enregistrer votre présence
              </p>
            </div>
            <Button onClick={() => setShowCodeDialog(true)} size="lg" className="gap-2">
              <KeyRound className="h-4 w-4" />
              Entrer le code
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={rate >= 80 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'}>
        <CardContent className="pt-6">
          {rate >= 80 ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-400">Excellent taux de présence !</p>
                <p className="text-sm text-green-600">Continuez ainsi pour valider vos cours.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-400">Attention à votre assiduité</p>
                <p className="text-sm text-amber-600">Un taux de présence minimum de 80% est requis pour valider vos cours.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Présences par cours</CardTitle>
          <CardDescription>Détail de vos présences pour chaque cours</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cours</TableHead>
                <TableHead className="text-center">Total séances</TableHead>
                <TableHead className="text-center">Présent</TableHead>
                <TableHead className="text-center">Absent</TableHead>
                <TableHead className="text-center">Taux</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.courses?.length > 0 ? data.courses.map((course: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{course.code}</p>
                      <p className="text-sm text-gray-500">{course.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">12</TableCell>
                  <TableCell className="text-center text-green-600">10</TableCell>
                  <TableCell className="text-center text-red-600">2</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-600">83%</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Aucune donnée de présence disponible
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Code de présence
            </DialogTitle>
            <DialogDescription>
              Entrez le code à 6 caractères fourni par votre enseignant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Ex: ABC123"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center text-2xl font-mono tracking-widest h-16"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 text-center">
              Le code est valide pendant une durée limitée. Assurez-vous d'être présent en classe.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCodeDialog(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button onClick={submitAttendanceCode} disabled={submitting || attendanceCode.length < 6}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Valider ma présence
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
