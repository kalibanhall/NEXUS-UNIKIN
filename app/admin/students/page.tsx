'use client'

import { useState } from 'react'
import { 
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  Download,
  Upload,
  Filter,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Wallet,
  UserCheck,
  UserX,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'

// Mock data
const studentsData = [
  {
    id: '1',
    matricule: 'L1-INFO-2025-001',
    firstName: 'Patrick',
    lastName: 'Mbuyi',
    email: 'patrick.mbuyi@student.unikin.ac.cd',
    phone: '+243 812 345 678',
    promotion: 'L1 Informatique',
    faculty: 'Sciences',
    dateOfBirth: '2003-05-15',
    gender: 'M',
    hasDebt: false,
    debtAmount: 0,
    isBlocked: false,
    isActive: true,
    avatar: null,
  },
  {
    id: '2',
    matricule: 'L1-INFO-2025-002',
    firstName: 'Marie',
    lastName: 'Kasongo',
    email: 'marie.kasongo@student.unikin.ac.cd',
    phone: '+243 823 456 789',
    promotion: 'L1 Informatique',
    faculty: 'Sciences',
    dateOfBirth: '2004-02-20',
    gender: 'F',
    hasDebt: true,
    debtAmount: 125000,
    isBlocked: true,
    isActive: true,
    avatar: null,
  },
  {
    id: '3',
    matricule: 'L1-INFO-2025-003',
    firstName: 'Jean',
    lastName: 'Ilunga',
    email: 'jean.ilunga@student.unikin.ac.cd',
    phone: '+243 834 567 890',
    promotion: 'L1 Informatique',
    faculty: 'Sciences',
    dateOfBirth: '2003-08-10',
    gender: 'M',
    hasDebt: false,
    debtAmount: 0,
    isBlocked: false,
    isActive: true,
    avatar: null,
  },
  {
    id: '4',
    matricule: 'L2-INFO-2024-015',
    firstName: 'Sarah',
    lastName: 'Mutombo',
    email: 'sarah.mutombo@student.unikin.ac.cd',
    phone: '+243 845 678 901',
    promotion: 'L2 Informatique',
    faculty: 'Sciences',
    dateOfBirth: '2002-11-25',
    gender: 'F',
    hasDebt: false,
    debtAmount: 0,
    isBlocked: false,
    isActive: true,
    avatar: null,
  },
  {
    id: '5',
    matricule: 'L1-INFO-2025-004',
    firstName: 'David',
    lastName: 'Lukusa',
    email: 'david.lukusa@student.unikin.ac.cd',
    phone: '+243 856 789 012',
    promotion: 'L1 Informatique',
    faculty: 'Sciences',
    dateOfBirth: '2004-01-05',
    gender: 'M',
    hasDebt: true,
    debtAmount: 250000,
    isBlocked: true,
    isActive: true,
    avatar: null,
  },
]

// Stats
const stats = {
  total: studentsData.length,
  active: studentsData.filter(s => s.isActive).length,
  withDebt: studentsData.filter(s => s.hasDebt).length,
  blocked: studentsData.filter(s => s.isBlocked).length,
}

export default function StudentsManagementPage() {
  const [students, setStudents] = useState(studentsData)
  const [searchTerm, setSearchTerm] = useState('')
  const [promotionFilter, setPromotionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<typeof studentsData[0] | null>(null)

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPromotion = promotionFilter === 'all' || student.promotion.includes(promotionFilter)
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && student.isActive && !student.isBlocked) ||
      (statusFilter === 'blocked' && student.isBlocked) ||
      (statusFilter === 'debt' && student.hasDebt)

    return matchesSearch && matchesPromotion && matchesStatus
  })

  // Toggle block status
  const toggleBlock = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const newBlocked = !s.isBlocked
        toast.success(`Étudiant ${newBlocked ? 'bloqué' : 'débloqué'}`)
        return { ...s, isBlocked: newBlocked }
      }
      return s
    }))
  }

  // View student details
  const viewStudent = (student: typeof studentsData[0]) => {
    setSelectedStudent(student)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7" />
            Gestion des Étudiants
          </h1>
          <p className="text-gray-500">
            Gérez les comptes et dossiers étudiants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-600">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-gray-500">Actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.withDebt}</p>
              <p className="text-sm text-gray-500">Avec dette</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.blocked}</p>
              <p className="text-sm text-gray-500">Bloqués</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, matricule, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={promotionFilter} onValueChange={setPromotionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Promotion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="L1">L1</SelectItem>
                <SelectItem value="L2">L2</SelectItem>
                <SelectItem value="L3">L3</SelectItem>
                <SelectItem value="M1">M1</SelectItem>
                <SelectItem value="M2">M2</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="blocked">Bloqués</SelectItem>
                <SelectItem value="debt">Avec dette</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>Étudiant</TableHead>
                <TableHead>Matricule</TableHead>
                <TableHead>Promotion</TableHead>
                <TableHead className="text-center">Dette</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow 
                  key={student.id}
                  className={cn(student.isBlocked && "bg-red-50 dark:bg-red-900/10")}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                          {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.lastName} {student.firstName}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student.matricule}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.promotion}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {student.hasDebt ? (
                      <div className="flex flex-col items-center">
                        <Badge variant="destructive" className="text-xs">
                          {formatCurrency(student.debtAmount)}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="success" className="text-xs">À jour</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.isBlocked ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit mx-auto">
                        <Lock className="w-3 h-3" />
                        Bloqué
                      </Badge>
                    ) : (
                      <Badge variant="success">Actif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewStudent(student)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleBlock(student.id)}>
                          {student.isBlocked ? (
                            <>
                              <Unlock className="w-4 h-4 mr-2" />
                              Débloquer
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Bloquer
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'étudiant</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Header with avatar */}
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {selectedStudent.lastName} {selectedStudent.firstName}
                  </h3>
                  <p className="text-gray-500 font-mono">{selectedStudent.matricule}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedStudent.promotion}</Badge>
                    {selectedStudent.isBlocked ? (
                      <Badge variant="destructive">Bloqué</Badge>
                    ) : (
                      <Badge variant="success">Actif</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-500">Email</Label>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedStudent.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Téléphone</Label>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedStudent.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Date de naissance</Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(selectedStudent.dateOfBirth).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Faculté</Label>
                  <p className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    {selectedStudent.faculty}
                  </p>
                </div>
              </div>

              {/* Financial status */}
              {selectedStudent.hasDebt && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">
                        Dette financière
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Montant impayé: {formatCurrency(selectedStudent.debtAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Fermer
            </Button>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
