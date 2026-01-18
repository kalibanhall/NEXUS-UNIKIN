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
import { Search, FileText, Eye, CheckCircle, Clock, XCircle, Printer } from 'lucide-react'

const mockDocuments = [
  {
    id: 1,
    reference: 'DOC-2024-001',
    etudiant: 'MBUYI Jean',
    matricule: 'ETU-2024-001',
    type: 'Attestation d\'inscription',
    dateDemande: '2024-01-15',
    status: 'prêt'
  },
  {
    id: 2,
    reference: 'DOC-2024-002',
    etudiant: 'KABONGO Marie',
    matricule: 'ETU-2024-002',
    type: 'Relevé de notes',
    dateDemande: '2024-01-16',
    status: 'en cours'
  },
  {
    id: 3,
    reference: 'DOC-2024-003',
    etudiant: 'MUTOMBO Pierre',
    matricule: 'ETU-2024-003',
    type: 'Attestation de réussite',
    dateDemande: '2024-01-17',
    status: 'en attente'
  },
  {
    id: 4,
    reference: 'DOC-2024-004',
    etudiant: 'LUMUMBA Patrick',
    matricule: 'ETU-2024-004',
    type: 'Certificat de scolarité',
    dateDemande: '2024-01-18',
    status: 'retiré'
  },
]

export default function EmployeeDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.etudiant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'prêt':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="h-3 w-3 mr-1" />Prêt</Badge>
      case 'en cours':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"><Clock className="h-3 w-3 mr-1" />En cours</Badge>
      case 'en attente':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      case 'retiré':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Retiré</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Documents</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Traiter les demandes de documents des étudiants
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">89</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">34</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">33</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demandes de documents</CardTitle>
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
                <TableHead>Référence</TableHead>
                <TableHead>Étudiant</TableHead>
                <TableHead>Matricule</TableHead>
                <TableHead>Type de document</TableHead>
                <TableHead>Date demande</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-mono">{doc.reference}</TableCell>
                  <TableCell className="font-medium">{doc.etudiant}</TableCell>
                  <TableCell>{doc.matricule}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.dateDemande}</TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {doc.status === 'prêt' && (
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        <Printer className="h-4 w-4" />
                      </Button>
                    )}
                    {(doc.status === 'en attente' || doc.status === 'en cours') && (
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
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
