'use client'

import { useState, useEffect } from 'react'
import { 
  BookOpen,
  Search,
  Filter,
  Heart,
  Download,
  Eye,
  Star,
  Clock,
  BookMarked,
  Bookmark,
  Calendar,
  User,
  FileText,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

interface Resource {
  id: string
  title: string
  author: string
  description: string
  resource_type: string
  category: string
  isbn?: string
  publication_year: number
  publisher?: string
  cover_image?: string
  file_url?: string
  total_copies: number
  available_copies: number
  is_favorite: boolean
  rating: number
  downloads_count: number
}

interface Loan {
  id: string
  resource_id: string
  resource_title: string
  resource_type: string
  borrowed_at: string
  due_date: string
  returned_at?: string
  is_overdue: boolean
  can_renew: boolean
}

interface Reservation {
  id: string
  resource_id: string
  resource_title: string
  reserved_at: string
  expires_at: string
  status: string
  position_in_queue: number
}

export default function StudentLibraryPage() {
  const { user } = useAuth()
  const studentInfo = user?.profile
  const [resources, setResources] = useState<Resource[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [favorites, setFavorites] = useState<Resource[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('catalog')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'catalog') {
        const response = await fetch(`/api/library?action=catalog&category=${selectedCategory}&search=${searchQuery}`)
        if (response.ok) {
          const data = await response.json()
          setResources(data.resources || [])
          setCategories(data.categories || [])
        }
      } else if (activeTab === 'loans') {
        const response = await fetch(`/api/library?action=my_loans&student_id=${studentInfo?.id}`)
        if (response.ok) {
          const data = await response.json()
          setLoans(data.loans || [])
        }
      } else if (activeTab === 'favorites') {
        const response = await fetch(`/api/library?action=my_favorites&student_id=${studentInfo?.id}`)
        if (response.ok) {
          const data = await response.json()
          setFavorites(data.favorites || [])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBorrow = async (resourceId: string) => {
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'borrow',
          resourceId,
          studentId: studentInfo?.id
        })
      })

      if (response.ok) {
        toast.success('Emprunt enregistré!')
        fetchData()
        setShowDetailDialog(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'emprunt')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleReserve = async (resourceId: string) => {
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reserve',
          resourceId,
          studentId: studentInfo?.id
        })
      })

      if (response.ok) {
        toast.success('Réservation effectuée!')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la réservation')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleToggleFavorite = async (resourceId: string) => {
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'favorite',
          resourceId,
          studentId: studentInfo?.id
        })
      })

      if (response.ok) {
        toast.success('Mis à jour!')
        fetchData()
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const handleRenewLoan = async (loanId: string) => {
    try {
      const response = await fetch('/api/library', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'renew',
          loanId
        })
      })

      if (response.ok) {
        toast.success('Emprunt prolongé!')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const getResourceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'BOOK': 'bg-blue-100 text-blue-700',
      'EBOOK': 'bg-purple-100 text-purple-700',
      'ARTICLE': 'bg-green-100 text-green-700',
      'THESIS': 'bg-amber-100 text-amber-700',
      'JOURNAL': 'bg-red-100 text-red-700'
    }
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-700'}>{type}</Badge>
  }

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Bibliothèque
        </h1>
        <p className="text-muted-foreground mt-1">
          Explorez les ressources et gérez vos emprunts
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loans.filter(l => !l.returned_at).length}</p>
                <p className="text-sm text-muted-foreground">Emprunts actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loans.filter(l => l.is_overdue).length}</p>
                <p className="text-sm text-muted-foreground">En retard</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <BookMarked className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reservations.length}</p>
                <p className="text-sm text-muted-foreground">Réservations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{favorites.length}</p>
                <p className="text-sm text-muted-foreground">Favoris</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="catalog">Catalogue</TabsTrigger>
          <TabsTrigger value="loans">Mes Emprunts</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-6 space-y-4">
          {/* Recherche et filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par titre, auteur..."
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
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des ressources */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredResources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune ressource trouvée</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="group hover:shadow-lg transition-all">
                  <div className="aspect-[3/4] relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg overflow-hidden">
                    {resource.cover_image ? (
                      <img 
                        src={resource.cover_image} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(resource.id)
                      }}
                    >
                      <Heart className={`h-4 w-4 ${resource.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <div className="absolute bottom-2 left-2">
                      {getResourceTypeBadge(resource.resource_type)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{resource.author}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm">{resource.rating?.toFixed(1) || '-'}</span>
                      </div>
                      <Badge variant={resource.available_copies > 0 ? 'default' : 'secondary'}>
                        {resource.available_copies > 0 ? `${resource.available_copies} dispo` : 'Indisponible'}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full"
                      variant={resource.available_copies > 0 ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedResource(resource)
                        setShowDetailDialog(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="loans" className="mt-6">
          {loans.filter(l => !l.returned_at).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun emprunt en cours</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {loans.filter(l => !l.returned_at).map((loan) => (
                <Card key={loan.id} className={loan.is_overdue ? 'border-red-300' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{loan.resource_title}</h3>
                          <p className="text-sm text-muted-foreground">{loan.resource_type}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Emprunté le {new Date(loan.borrowed_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span className={`flex items-center gap-1 ${loan.is_overdue ? 'text-red-600' : ''}`}>
                              <Clock className="h-4 w-4" />
                              Retour avant le {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {loan.is_overdue && (
                          <Badge variant="destructive">En retard</Badge>
                        )}
                        {loan.can_renew && (
                          <Button 
                            variant="outline"
                            onClick={() => handleRenewLoan(loan.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Prolonger
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

        <TabsContent value="favorites" className="mt-6">
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun favori</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.map((resource) => (
                <Card key={resource.id} className="group hover:shadow-lg transition-all">
                  <div className="aspect-[3/4] relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg overflow-hidden">
                    {resource.cover_image ? (
                      <img 
                        src={resource.cover_image} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => handleToggleFavorite(resource.id)}
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{resource.author}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full"
                      variant={resource.available_copies > 0 ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedResource(resource)
                        setShowDetailDialog(true)
                      }}
                    >
                      {resource.available_copies > 0 ? 'Emprunter' : 'Réserver'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Détails */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedResource?.title}</DialogTitle>
            <DialogDescription>{selectedResource?.author}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6">
            <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
              {selectedResource?.cover_image ? (
                <img 
                  src={selectedResource.cover_image} 
                  alt={selectedResource.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="h-16 w-16 text-muted-foreground" />
              )}
            </div>

            <div className="col-span-2 space-y-4">
              <div className="flex flex-wrap gap-2">
                {getResourceTypeBadge(selectedResource?.resource_type || '')}
                <Badge variant="outline">{selectedResource?.category}</Badge>
                {selectedResource?.publication_year && (
                  <Badge variant="outline">{selectedResource.publication_year}</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {selectedResource?.description || 'Aucune description disponible.'}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedResource?.isbn && (
                  <div>
                    <p className="text-muted-foreground">ISBN</p>
                    <p className="font-medium">{selectedResource.isbn}</p>
                  </div>
                )}
                {selectedResource?.publisher && (
                  <div>
                    <p className="text-muted-foreground">Éditeur</p>
                    <p className="font-medium">{selectedResource.publisher}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Disponibilité</p>
                  <p className="font-medium">
                    {selectedResource?.available_copies} / {selectedResource?.total_copies} exemplaires
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Note</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium">{selectedResource?.rating?.toFixed(1) || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {selectedResource?.available_copies && selectedResource.available_copies > 0 ? (
                  <Button onClick={() => handleBorrow(selectedResource!.id)}>
                    <BookMarked className="h-4 w-4 mr-2" />
                    Emprunter
                  </Button>
                ) : (
                  <Button onClick={() => handleReserve(selectedResource!.id)}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Réserver
                  </Button>
                )}
                {selectedResource?.file_url && (
                  <Button variant="outline" asChild>
                    <a href={selectedResource.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleToggleFavorite(selectedResource!.id)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${selectedResource?.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {selectedResource?.is_favorite ? 'Retirer' : 'Favoris'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
