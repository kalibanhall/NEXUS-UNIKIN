'use client'

import { useState } from 'react'
import { 
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  BookOpen,
  GraduationCap,
  Eye,
  Check,
  X,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

// Mock data - Faculties
const facultiesData = [
  {
    id: '1',
    code: 'FSC',
    name: 'Faculté des Sciences',
    dean: 'Prof. Jean-Pierre Kabongo',
    departments: 8,
    students: 2450,
    teachers: 124,
    isActive: true,
  },
  {
    id: '2',
    code: 'FLT',
    name: 'Faculté des Lettres',
    dean: 'Prof. Marie Mutombo',
    departments: 6,
    students: 1890,
    teachers: 98,
    isActive: true,
  },
  {
    id: '3',
    code: 'FDR',
    name: 'Faculté de Droit',
    dean: 'Prof. Pierre Ilunga',
    departments: 4,
    students: 3200,
    teachers: 78,
    isActive: true,
  },
  {
    id: '4',
    code: 'FMD',
    name: 'Faculté de Médecine',
    dean: 'Prof. Sophie Kasongo',
    departments: 5,
    students: 1560,
    teachers: 156,
    isActive: true,
  },
  {
    id: '5',
    code: 'FSE',
    name: 'Faculté des Sciences Économiques',
    dean: 'Prof. David Lukusa',
    departments: 3,
    students: 2890,
    teachers: 67,
    isActive: true,
  },
]

// Mock data - Departments
const departmentsData = [
  {
    id: '1',
    code: 'INFO',
    name: 'Informatique',
    faculty: 'Faculté des Sciences',
    head: 'Dr. Patrick Mbuyi',
    promotions: 5,
    students: 456,
    teachers: 18,
    isActive: true,
  },
  {
    id: '2',
    code: 'MATH',
    name: 'Mathématiques',
    faculty: 'Faculté des Sciences',
    head: 'Dr. Claire Ndaya',
    promotions: 5,
    students: 234,
    teachers: 15,
    isActive: true,
  },
  {
    id: '3',
    code: 'PHYS',
    name: 'Physique',
    faculty: 'Faculté des Sciences',
    head: 'Dr. Michel Tshilumba',
    promotions: 5,
    students: 189,
    teachers: 12,
    isActive: true,
  },
  {
    id: '4',
    code: 'CHIM',
    name: 'Chimie',
    faculty: 'Faculté des Sciences',
    head: 'Dr. Anne Kalonji',
    promotions: 5,
    students: 210,
    teachers: 14,
    isActive: true,
  },
]

// Mock data - Promotions
const promotionsData = [
  {
    id: '1',
    level: 'L1',
    name: 'Licence 1 Informatique',
    department: 'Informatique',
    academicYear: '2025-2026',
    students: 156,
    courses: 12,
    isActive: true,
  },
  {
    id: '2',
    level: 'L2',
    name: 'Licence 2 Informatique',
    department: 'Informatique',
    academicYear: '2025-2026',
    students: 134,
    courses: 14,
    isActive: true,
  },
  {
    id: '3',
    level: 'L3',
    name: 'Licence 3 Informatique',
    department: 'Informatique',
    academicYear: '2025-2026',
    students: 98,
    courses: 16,
    isActive: true,
  },
  {
    id: '4',
    level: 'M1',
    name: 'Master 1 Informatique',
    department: 'Informatique',
    academicYear: '2025-2026',
    students: 45,
    courses: 10,
    isActive: true,
  },
  {
    id: '5',
    level: 'M2',
    name: 'Master 2 Informatique',
    department: 'Informatique',
    academicYear: '2025-2026',
    students: 23,
    courses: 8,
    isActive: true,
  },
]

export default function AcademicStructurePage() {
  const [activeTab, setActiveTab] = useState('faculties')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    dean: '',
    head: '',
    facultyId: '',
    departmentId: '',
    level: '',
    academicYear: '2025-2026',
  })

  const handleSave = async () => {
    toast.success(`${editingItem ? 'Modification' : 'Création'} effectuée avec succès`)
    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({
      code: '',
      name: '',
      dean: '',
      head: '',
      facultyId: '',
      departmentId: '',
      level: '',
      academicYear: '2025-2026',
    })
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      code: item.code || '',
      name: item.name || '',
      dean: item.dean || '',
      head: item.head || '',
      facultyId: item.facultyId || '',
      departmentId: item.departmentId || '',
      level: item.level || '',
      academicYear: item.academicYear || '2025-2026',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    toast.success('Élément supprimé avec succès')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7" />
            Structure Académique
          </h1>
          <p className="text-gray-500">
            Gestion des facultés, départements et promotions
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{facultiesData.length}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Facultés</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{departmentsData.length}</p>
            <p className="text-sm text-green-600 dark:text-green-400">Départements</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{promotionsData.length}</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">Promotions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">12,000</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">Étudiants</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList>
                <TabsTrigger value="faculties" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Facultés
                </TabsTrigger>
                <TabsTrigger value="departments" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Départements
                </TabsTrigger>
                <TabsTrigger value="promotions" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Promotions
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? 'Modifier' : 'Ajouter'}{' '}
                        {activeTab === 'faculties' ? 'une faculté' :
                         activeTab === 'departments' ? 'un département' : 'une promotion'}
                      </DialogTitle>
                      <DialogDescription>
                        Remplissez les informations ci-dessous
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">
                          Code
                        </Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          className="col-span-3"
                          placeholder="Ex: INFO, FSC..."
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nom
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="col-span-3"
                          placeholder="Nom complet"
                        />
                      </div>
                      {activeTab === 'faculties' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="dean" className="text-right">
                            Doyen
                          </Label>
                          <Input
                            id="dean"
                            value={formData.dean}
                            onChange={(e) => setFormData({ ...formData, dean: e.target.value })}
                            className="col-span-3"
                            placeholder="Nom du doyen"
                          />
                        </div>
                      )}
                      {activeTab === 'departments' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="head" className="text-right">
                            Chef de département
                          </Label>
                          <Input
                            id="head"
                            value={formData.head}
                            onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                            className="col-span-3"
                            placeholder="Nom du chef"
                          />
                        </div>
                      )}
                      {activeTab === 'promotions' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="level" className="text-right">
                            Niveau
                          </Label>
                          <Input
                            id="level"
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            className="col-span-3"
                            placeholder="L1, L2, M1..."
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleSave}>
                        {editingItem ? 'Modifier' : 'Créer'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Faculties Tab */}
            <TabsContent value="faculties" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Doyen</TableHead>
                    <TableHead className="text-center">Départements</TableHead>
                    <TableHead className="text-center">Étudiants</TableHead>
                    <TableHead className="text-center">Enseignants</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultiesData.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-mono font-medium">{faculty.code}</TableCell>
                      <TableCell className="font-medium">{faculty.name}</TableCell>
                      <TableCell>{faculty.dean}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{faculty.departments}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{faculty.students.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{faculty.teachers}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={faculty.isActive ? 'success' : 'secondary'}>
                          {faculty.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(faculty)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(faculty.id)} className="text-red-600">
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
            </TabsContent>

            {/* Departments Tab */}
            <TabsContent value="departments" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Faculté</TableHead>
                    <TableHead>Chef</TableHead>
                    <TableHead className="text-center">Promotions</TableHead>
                    <TableHead className="text-center">Étudiants</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentsData.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-mono font-medium">{dept.code}</TableCell>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.faculty}</TableCell>
                      <TableCell>{dept.head}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{dept.promotions}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{dept.students}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={dept.isActive ? 'success' : 'secondary'}>
                          {dept.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(dept)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(dept.id)} className="text-red-600">
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
            </TabsContent>

            {/* Promotions Tab */}
            <TabsContent value="promotions" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Niveau</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Année académique</TableHead>
                    <TableHead className="text-center">Étudiants</TableHead>
                    <TableHead className="text-center">Cours</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotionsData.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                          {promo.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{promo.name}</TableCell>
                      <TableCell>{promo.department}</TableCell>
                      <TableCell>{promo.academicYear}</TableCell>
                      <TableCell className="text-center">{promo.students}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{promo.courses}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={promo.isActive ? 'success' : 'secondary'}>
                          {promo.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(promo)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(promo.id)} className="text-red-600">
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
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}
