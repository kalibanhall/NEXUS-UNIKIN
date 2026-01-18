'use client'

import { useState, useEffect } from 'react'
import { 
  Library, 
  Search, 
  BookOpen, 
  FileText, 
  Video, 
  Download,
  Star,
  StarOff,
  Clock,
  Filter,
  Plus,
  Eye,
  Heart,
  BookMarked,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'

interface LibraryResource {
  id: string
  title: string
  authors: string[]
  publisher: string
  publication_year: number
  resource_type: string
  category: string
  cover_image_url: string
  available_copies: number
  total_copies: number
  is_digital: boolean
  views_count: number
  description?: string
}

interface Loan {
  id: string
  resource_id: string
  title: string
  authors: string[]
  borrowed_at: string
  due_date: string
  status: string
  renewals_count: number
}

export default function LibraryPage() {
  const [resources, setResources] = useState<LibraryResource[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [favorites, setFavorites] = useState<LibraryResource[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedResource, setSelectedResource] = useState<LibraryResource | null>(null)
  const [activeTab, setActiveTab] = useState('catalog')

  useEffect(() => {
    fetchResources()
    fetchCategories()
  }, [searchQuery, selectedCategory, selectedType])

  useEffect(() => {
    if (activeTab === 'loans') {
      fetchLoans()
    } else if (activeTab === 'favorites') {
      fetchFavorites()
    }
  }, [activeTab])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedType) params.append('type', selectedType)

      const response = await fetch(`/api/library?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources || [])
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Erreur lors du chargement du catalogue')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/library?action=categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchLoans = async () => {
    try {
      const response = await fetch('/api/library?action=my_loans')
      if (response.ok) {
        const data = await response.json()
        setLoans(data.loans || [])
      }
    } catch (error) {
      console.error('Error fetching loans:', error)
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/library?action=my_favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const handleBorrow = async (resourceId: string) => {
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'borrow', resourceId })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        fetchResources()
        fetchLoans()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'emprunt')
    }
  }

  const handleReserve = async (resourceId: string) => {
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reserve', resourceId })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de la réservation')
    }
  }

  const handleFavorite = async (resourceId: string, isFavorite: boolean) => {
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isFavorite ? 'unfavorite' : 'favorite', resourceId })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        if (activeTab === 'favorites') {
          fetchFavorites()
        }
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const handleRenew = async (loanId: string) => {
    try {
      const response = await fetch('/api/library', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'renew', loanId })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        fetchLoans()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors du renouvellement')
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'BOOK': return <BookOpen className="h-5 w-5" />
      case 'THESIS': return <FileText className="h-5 w-5" />
      case 'JOURNAL': return <BookMarked className="h-5 w-5" />
      case 'VIDEO': return <Video className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const resourceTypes = [
    { value: 'BOOK', label: 'Livres' },
    { value: 'THESIS', label: 'Thèses & Mémoires' },
    { value: 'JOURNAL', label: 'Revues' },
    { value: 'ARTICLE', label: 'Articles' },
    { value: 'VIDEO', label: 'Vidéos' },
    { value: 'EBOOK', label: 'E-Books' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Library className="h-8 w-8 text-primary" />
            Bibliothèque Numérique
          </h1>
          <p className="text-muted-foreground mt-1">
            Explorez notre catalogue de ressources académiques
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="catalog">Catalogue</TabsTrigger>
          <TabsTrigger value="loans">Mes Emprunts</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
        </TabsList>

        {/* Catalogue */}
        <TabsContent value="catalog" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par titre, auteur, mot-clé..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.category} value={cat.category}>
                        {cat.category} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous types</SelectItem>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                  setSelectedType('')
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : resources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Library className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune ressource trouvée</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resources.map((resource) => (
                <Card key={resource.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5">
                    {resource.cover_image_url ? (
                      <img 
                        src={resource.cover_image_url} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getResourceIcon(resource.resource_type)}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {resource.is_digital && (
                        <Badge className="bg-blue-500">Digital</Badge>
                      )}
                      <Badge variant="outline" className="bg-background/80">
                        {resource.resource_type}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white bg-black/50 px-2 py-1 rounded">
                      <Eye className="h-3 w-3" />
                      {resource.views_count}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-1">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {resource.authors?.join(', ')}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{resource.publisher}</span>
                      <span>{resource.publication_year}</span>
                    </div>
                    {!resource.is_digital && (
                      <div className="mt-2">
                        <Badge variant={resource.available_copies > 0 ? 'default' : 'destructive'}>
                          {resource.available_copies}/{resource.total_copies} disponibles
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1" onClick={() => setSelectedResource(resource)}>
                          Détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{selectedResource?.title}</DialogTitle>
                          <DialogDescription>
                            {selectedResource?.authors?.join(', ')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1">
                            {selectedResource?.cover_image_url ? (
                              <img 
                                src={selectedResource.cover_image_url} 
                                alt={selectedResource.title}
                                className="w-full rounded-lg"
                              />
                            ) : (
                              <div className="w-full aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Description</p>
                              <p className="text-sm">{selectedResource?.description || 'Pas de description disponible'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Éditeur</p>
                                <p>{selectedResource?.publisher}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Année</p>
                                <p>{selectedResource?.publication_year}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Catégorie</p>
                                <p>{selectedResource?.category}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Vues</p>
                                <p>{selectedResource?.views_count}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                              {selectedResource?.is_digital ? (
                                <Button className="flex-1">
                                  <Download className="h-4 w-4 mr-2" />
                                  Télécharger
                                </Button>
                              ) : selectedResource?.available_copies && selectedResource.available_copies > 0 ? (
                                <Button 
                                  className="flex-1"
                                  onClick={() => selectedResource && handleBorrow(selectedResource.id)}
                                >
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Emprunter
                                </Button>
                              ) : (
                                <Button 
                                  variant="secondary" 
                                  className="flex-1"
                                  onClick={() => selectedResource && handleReserve(selectedResource.id)}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Réserver
                                </Button>
                              )}
                              <Button 
                                variant="outline"
                                onClick={() => selectedResource && handleFavorite(selectedResource.id, false)}
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleFavorite(resource.id, false)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Mes Emprunts */}
        <TabsContent value="loans" className="space-y-4">
          {loans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Vous n'avez aucun emprunt en cours</p>
                <Button variant="link" onClick={() => setActiveTab('catalog')}>
                  Parcourir le catalogue
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <Card key={loan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{loan.title}</h3>
                          <p className="text-sm text-muted-foreground">{loan.authors?.join(', ')}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Emprunté le {new Date(loan.borrowed_at).toLocaleDateString('fr-FR')}
                            </span>
                            <Badge variant={new Date(loan.due_date) < new Date() ? 'destructive' : 'secondary'}>
                              Retour: {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {loan.renewals_count}/2 renouvellements
                        </Badge>
                        {loan.status === 'ACTIVE' && loan.renewals_count < 2 && (
                          <Button variant="outline" size="sm" onClick={() => handleRenew(loan.id)}>
                            Renouveler
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Favoris */}
        <TabsContent value="favorites" className="space-y-4">
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Vous n'avez pas encore de favoris</p>
                <Button variant="link" onClick={() => setActiveTab('catalog')}>
                  Parcourir le catalogue
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {favorites.map((resource) => (
                <Card key={resource.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        {getResourceIcon(resource.resource_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2">{resource.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {resource.authors?.join(', ')}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleFavorite(resource.id, true)}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline">{resource.resource_type}</Badge>
                      {!resource.is_digital && (
                        <span className="text-xs text-muted-foreground">
                          {resource.available_copies} dispo.
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
