'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Settings, Building, Mail, Database, Globe, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    emailNotifications: true,
    autoBackup: true
  })

  const handleSave = () => {
    toast.success('Paramètres enregistrés avec succès')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres du système</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Configurer les paramètres globaux de l'application
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Institution
            </CardTitle>
            <CardDescription>
              Informations de l'université
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="universityName">Nom de l'université</Label>
              <Input id="universityName" defaultValue="Université de Kinshasa" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="acronym">Sigle</Label>
              <Input id="acronym" defaultValue="UNIKIN" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" defaultValue="Kinshasa, RDC" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" defaultValue="+243 999 000 000" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email
            </CardTitle>
            <CardDescription>
              Configuration des emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="smtpHost">Serveur SMTP</Label>
              <Input id="smtpHost" defaultValue="smtp.unikin.ac.cd" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtpPort">Port</Label>
              <Input id="smtpPort" defaultValue="587" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtpUser">Utilisateur</Label>
              <Input id="smtpUser" defaultValue="noreply@unikin.ac.cd" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtpPassword">Mot de passe</Label>
              <Input id="smtpPassword" type="password" defaultValue="********" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de données
            </CardTitle>
            <CardDescription>
              Informations de la base de données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Serveur</Label>
              <Input value="localhost:5432" disabled />
            </div>
            <div className="grid gap-2">
              <Label>Base de données</Label>
              <Input value="nexus_unikin" disabled />
            </div>
            <div className="grid gap-2">
              <Label>Taille</Label>
              <Input value="156 MB" disabled />
            </div>
            <Button variant="outline" className="w-full">
              Sauvegarder maintenant
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Options générales
            </CardTitle>
            <CardDescription>
              Paramètres de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mode maintenance</p>
                <p className="text-sm text-gray-500">Désactiver l'accès aux utilisateurs</p>
              </div>
              <Switch 
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Inscriptions ouvertes</p>
                <p className="text-sm text-gray-500">Permettre les nouvelles inscriptions</p>
              </div>
              <Switch 
                checked={settings.registrationOpen}
                onCheckedChange={(checked) => setSettings({...settings, registrationOpen: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications email</p>
                <p className="text-sm text-gray-500">Envoyer des emails automatiques</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup automatique</p>
                <p className="text-sm text-gray-500">Sauvegarder quotidiennement</p>
              </div>
              <Switch 
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  )
}
