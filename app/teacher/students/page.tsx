'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Users, Eye, Mail, BarChart3 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const mockStudents = [
  {
    id: 1,
    matricule: 'ETU-2024-001',
    nom: 'MBUYI',
    prenom: 'Jean',
    email: 'etudiant.mbuyi@student.unikin.ac.cd',
    cours: 'Algorithmique',
    moyenne: 14.5,
    presence: 85
  },
  {
    id: 2,
    matricule: 'ETU-2024-002',
    nom: 'KABONGO',
    prenom: 'Marie',
    email: 'marie.kabongo@student.unikin.ac.cd',
    cours: 'Algorithmique',
    moyenne: 16.2,
    presence: 92
  },
  {
    id: 3,
    matricule: 'ETU-2024-003',
    nom: 'MUTOMBO',
    prenom: 'Pierre',
    email: 'pierre.mutombo@student.unikin.ac.cd',
    cours: 'Base de données',
    moyenne: 12.8,
    presence: 78
  },
  {
    id: 4,
    matricule: 'ETU-2024-004',
    nom: 'LUMUMBA',
    prenom: 'Patrick',
    email: 'patrick.lumumba@student.unikin.ac.cd',
    cours: 'Base de données',
    moyenne: 15.0,
    presence: 95
  },
]

const courses = ['Tous les cours', 'Algorithmique', 'Base de données', 'Réseaux informatiques']

export default function TeacherStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('Tous les cours')

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === 'Tous les cours' || student.cours === selectedCourse
    return matchesSearch && matchesCourse
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes Étudiants</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Liste des étudiants inscrits à vos cours
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">sur tous vos cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13.8/20</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de présence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">87%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">78%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des étudiants</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrer par cours" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Nom complet</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Moyenne</TableHead>
                <TableHead>Présence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono">{student.matricule}</TableCell>
                  <TableCell className="font-medium">
                    {student.nom} {student.prenom}
                  </TableCell>
                  <TableCell>{student.cours}</TableCell>
                  <TableCell>
                    <Badge variant={student.moyenne >= 10 ? 'default' : 'destructive'}>
                      {student.moyenne}/20
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        student.presence >= 80 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                      }
                    >
                      {student.presence}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mail className="h-4 w-4" />
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
