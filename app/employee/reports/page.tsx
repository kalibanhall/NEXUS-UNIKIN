'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, BarChart3, Users, DollarSign, Calendar } from 'lucide-react'

const reports = [
  {
    title: 'Rapport des inscriptions',
    description: 'Statistiques complètes des inscriptions par faculté et promotion',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Rapport financier',
    description: 'État des paiements, recettes et créances des étudiants',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Rapport des documents',
    description: 'Statistiques des demandes de documents traités',
    icon: FileText,
    color: 'text-purple-600'
  },
  {
    title: 'Rapport d\'activité',
    description: 'Résumé des activités quotidiennes et hebdomadaires',
    icon: Calendar,
    color: 'text-orange-600'
  },
  {
    title: 'Statistiques globales',
    description: 'Vue d\'ensemble des indicateurs clés de performance',
    icon: BarChart3,
    color: 'text-red-600'
  },
]

export default function EmployeeReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapports</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Générer et télécharger des rapports
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports générés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Téléchargements</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière génération</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Aujourd'hui</div>
            <p className="text-xs text-muted-foreground">14:30</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-xs text-muted-foreground">Rapports programmés</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <report.icon className={`h-6 w-6 ${report.color}`} />
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {report.description}
              </p>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapports récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Rapport inscriptions Janvier 2024', date: '15/01/2024', size: '2.3 MB' },
              { name: 'Rapport financier Décembre 2023', date: '31/12/2023', size: '1.8 MB' },
              { name: 'Statistiques annuelles 2023', date: '01/01/2024', size: '5.2 MB' },
            ].map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.date} • {file.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
