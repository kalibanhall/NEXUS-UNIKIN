'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, FileText, Upload, Download, Plus, Eye, Trash2 } from 'lucide-react'

const mockResources = [
  {
    id: 1,
    name: 'Cours - Introduction à l\'algorithmique',
    type: 'PDF',
    course: 'Algorithmique',
    size: '2.3 MB',
    date: '2024-01-10',
    downloads: 45
  },
  {
    id: 2,
    name: 'TP1 - Structures de données',
    type: 'PDF',
    course: 'Algorithmique',
    size: '1.1 MB',
    date: '2024-01-12',
    downloads: 38
  },
  {
    id: 3,
    name: 'Slides - SQL Avancé',
    type: 'PPTX',
    course: 'Base de données',
    size: '5.6 MB',
    date: '2024-01-15',
    downloads: 52
  },
  {
    id: 4,
    name: 'Exercices - Normalisation',
    type: 'DOCX',
    course: 'Base de données',
    size: '890 KB',
    date: '2024-01-18',
    downloads: 29
  },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case 'PDF':
      return 'text-red-600'
    case 'PPTX':
      return 'text-orange-600'
    case 'DOCX':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

export default function TeacherResourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ressources pédagogiques</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gérer et partager vos supports de cours
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Ajouter une ressource
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total fichiers</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Téléchargements</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">ce semestre</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espace utilisé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156 MB</div>
            <p className="text-xs text-muted-foreground">sur 1 GB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière mise à jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Hier</div>
            <p className="text-xs text-muted-foreground">14:30</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes ressources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockResources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <FileText className={`h-10 w-10 ${getFileIcon(resource.type)}`} />
                  <div>
                    <p className="font-medium">{resource.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Badge variant="outline">{resource.type}</Badge>
                      <span>{resource.course}</span>
                      <span>•</span>
                      <span>{resource.size}</span>
                      <span>•</span>
                      <span>{resource.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 mr-4">
                    <Download className="h-4 w-4 inline mr-1" />
                    {resource.downloads}
                  </span>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
