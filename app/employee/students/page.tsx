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
import { Search, Plus, Eye, Edit, Users } from 'lucide-react'

const mockStudents = [
  {
    id: 1,
    matricule: 'ETU-2024-001',
    nom: 'MBUYI',
    prenom: 'Jean',
    email: 'etudiant.mbuyi@student.unikin.ac.cd',
    faculte: 'Sciences',
    promotion: 'L1 INFO',
    status: 'actif'
  },
  {
    id: 2,
    matricule: 'ETU-2024-002',
    nom: 'KABONGO',
    prenom: 'Marie',
    email: 'marie.kabongo@student.unikin.ac.cd',
    faculte: 'Sciences',
    promotion: 'L2 INFO',
    status: 'actif'
  },
  {
    id: 3,
    matricule: 'ETU-2024-003',
    nom: 'MUTOMBO',
    prenom: 'Pierre',
    email: 'pierre.mutombo@student.unikin.ac.cd',
    faculte: 'Droit',
    promotion: 'L1 DROIT',
    status: 'inactif'
  },
  {
    id: 4,
    matricule: 'ETU-2024-004',
    nom: 'LUMUMBA',
    prenom: 'Patrick',
    email: 'patrick.lumumba@student.unikin.ac.cd',
    faculte: 'Médecine',
    promotion: 'D1 MED',
    status: 'actif'
  },
]

export default function EmployeeStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStudents = mockStudents.filter(student =>
    student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Étudiants</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Consulter et gérer les dossiers des étudiants
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel étudiant
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport à l'année dernière
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,180</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">54</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux (ce mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">23</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des étudiants</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, prénom ou matricule..."
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
                <TableHead>Matricule</TableHead>
                <TableHead>Nom complet</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Faculté</TableHead>
                <TableHead>Promotion</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.faculte}</TableCell>
                  <TableCell>{student.promotion}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'actif' ? 'default' : 'destructive'}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
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
