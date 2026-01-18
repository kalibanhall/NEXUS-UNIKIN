'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TeacherReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapports</h1>
        <p className="text-gray-500 dark:text-gray-400">Génération de rapports et statistiques</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rapport de notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Générer un rapport complet des notes de vos étudiants par cours
            </p>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Générer
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistiques de présence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Visualiser les statistiques de présence de vos étudiants
            </p>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Générer
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              PV de délibération
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Générer le procès-verbal de délibération pour vos cours
            </p>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Générer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
