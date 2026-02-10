'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  MessageCircle, Send, Search, Plus, MoreVertical, 
  Phone, Video, Info, Smile, Paperclip, Image,
  Check, CheckCheck, Circle, User, Users, RefreshCw, Loader2, UserPlus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  contact_id?: number
  name: string
  contact_name?: string
  email: string
  role: string
  contact_role?: string
  avatar?: string
  isOnline: boolean
  lastSeen?: string
  unreadCount?: number
  unread_count?: number
  lastMessage?: string
  last_message?: string
  lastMessageTime?: string
  last_message_time?: string
}

interface Message {
  id: string | number
  senderId: string | number
  sender_id?: number
  receiverId: string | number
  receiver_id?: number
  content: string
  createdAt: string
  created_at?: string
  read: boolean
  is_read?: boolean
  type: 'text' | 'image' | 'file'
}

// Composant indicateur de statut
const StatusIndicator = ({ isOnline, size = 'sm' }: { isOnline: boolean; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }
  return (
    <span 
      className={cn(
        sizeClasses[size],
        'rounded-full border-2 border-white dark:border-gray-900',
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      )}
    />
  )
}

interface SearchUser {
  id: number
  name: string
  email: string
  role: string
}

export default function StudentMessagesPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [searchingUsers, setSearchingUsers] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Récupérer les conversations depuis l'API
  const fetchContacts = useCallback(async () => {
    if (!user?.userId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?user_id=${user.userId}`)
      if (response.ok) {
        const data = await response.json()
        // Normaliser les données de l'API
        const normalizedContacts = (data.conversations || []).map((conv: any) => ({
          id: String(conv.contact_id),
          contact_id: conv.contact_id,
          name: conv.contact_name,
          contact_name: conv.contact_name,
          email: conv.contact_email || '',
          role: conv.contact_role || 'UNKNOWN',
          contact_role: conv.contact_role,
          isOnline: conv.is_online || false,
          lastSeen: conv.last_seen,
          unreadCount: conv.unread_count || 0,
          unread_count: conv.unread_count,
          lastMessage: conv.last_message,
          last_message: conv.last_message,
          lastMessageTime: conv.last_message_time,
          last_message_time: conv.last_message_time
        }))
        setContacts(normalizedContacts)
      }
    } catch (error) {
      console.error('Erreur récupération conversations:', error)
      toast.error('Erreur de chargement des conversations')
    } finally {
      setLoading(false)
    }
  }, [user?.userId])

  useEffect(() => {
    if (user?.userId) {
      fetchContacts()
      updateOnlineStatus()
      const interval = setInterval(updateOnlineStatus, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.userId, fetchContacts])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Polling pour rafraîchir les messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.userId) {
        fetchContacts()
        if (selectedContact) {
          fetchMessages(selectedContact.id)
        }
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }, [user?.userId, selectedContact, fetchContacts])

  const updateOnlineStatus = async () => {
    if (!user?.userId) return
    try {
      await fetch('/api/user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, status: 'ONLINE' })
      })
    } catch (error) {
      // Silently fail
    }
  }

  const fetchMessages = async (contactId: string) => {
    if (!user?.userId) return
    
    try {
      const response = await fetch(
        `/api/messages?user_id=${user.userId}&contact_id=${contactId}&type=messages`
      )
      if (response.ok) {
        const data = await response.json()
        // Normaliser les messages
        const normalizedMessages = (data.messages || []).map((msg: any) => ({
          id: String(msg.id),
          senderId: String(msg.sender_id),
          sender_id: msg.sender_id,
          receiverId: String(msg.receiver_id),
          receiver_id: msg.receiver_id,
          content: msg.content,
          createdAt: msg.created_at,
          created_at: msg.created_at,
          read: msg.is_read || false,
          is_read: msg.is_read,
          type: 'text' as const
        }))
        setMessages(normalizedMessages)
        
        // Marquer les messages comme lus
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: parseInt(contactId),
            receiverId: user.userId
          })
        })
      }
    } catch (error) {
      console.error('Erreur récupération messages:', error)
    }
  }

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact)
    fetchMessages(contact.id)
    // Marquer comme lu localement
    setContacts(prev => prev.map(c => 
      c.id === contact.id ? { ...c, unreadCount: 0, unread_count: 0 } : c
    ))
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !user?.userId) return
    
    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.userId,
          receiverId: parseInt(selectedContact.id),
          content: newMessage.trim()
        })
      })
      
      if (response.ok) {
        setNewMessage('')
        fetchMessages(selectedContact.id)
        fetchContacts()
        toast.success('Message envoyé')
      } else {
        throw new Error('Erreur envoi message')
      }
    } catch (error) {
      console.error('Erreur envoi message:', error)
      toast.error('Erreur d\'envoi')
    } finally {
      setSending(false)
    }
  }

  // Rechercher des utilisateurs pour nouvelle conversation
  const searchUsersForNewMessage = async (term: string) => {
    if (!term.trim()) {
      setSearchUsers([])
      return
    }
    
    setSearchingUsers(true)
    try {
      const response = await fetch(`/api/users?search=${encodeURIComponent(term)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setSearchUsers(data.users || data || [])
      }
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error)
    } finally {
      setSearchingUsers(false)
    }
  }

  // Démarrer une nouvelle conversation
  const startNewConversation = (searchUser: SearchUser) => {
    const newContact: Contact = {
      id: String(searchUser.id),
      contact_id: searchUser.id,
      name: searchUser.name,
      contact_name: searchUser.name,
      email: searchUser.email,
      role: searchUser.role,
      contact_role: searchUser.role,
      isOnline: false,
      unreadCount: 0,
      unread_count: 0,
      lastMessage: '',
      last_message: '',
      lastMessageTime: new Date().toISOString(),
      last_message_time: new Date().toISOString()
    }
    setSelectedContact(newContact)
    setMessages([])
    setShowNewMessageDialog(false)
    setUserSearchTerm('')
    setSearchUsers([])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Hier'
    } else if (days < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    }
  }

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return 'Hors ligne'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Vu récemment'
    if (hours < 24) return `Vu il y a ${hours}h`
    return `Vu le ${date.toLocaleDateString('fr-FR')}`
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      TEACHER: 'Enseignant',
      STUDENT: 'Étudiant',
      ADMIN: 'Administration',
      EMPLOYEE: 'Personnel'
    }
    return labels[role] || role
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      TEACHER: 'bg-blue-100 text-blue-800',
      STUDENT: 'bg-green-100 text-green-800',
      ADMIN: 'bg-purple-100 text-purple-800',
      EMPLOYEE: 'bg-amber-100 text-amber-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const filteredContacts = contacts.filter(c => 
    (c.name || c.contact_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = contacts.reduce((acc, c) => acc + (c.unreadCount || c.unread_count || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-180px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Messagerie
            {totalUnread > 0 && (
              <Badge className="bg-red-500">{totalUnread}</Badge>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Échangez avec vos professeurs et collègues</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
            <Button variant="outline" size="sm" onClick={() => setShowNewMessageDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau message
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle conversation</DialogTitle>
                <DialogDescription>
                  Recherchez un utilisateur pour démarrer une conversation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    className="pl-10"
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value)
                      searchUsersForNewMessage(e.target.value)
                    }}
                  />
                </div>
                <ScrollArea className="h-[300px]">
                  {searchingUsers ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : searchUsers.length > 0 ? (
                    <div className="space-y-2">
                      {searchUsers.map((searchUser) => (
                        <div
                          key={searchUser.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => startNewConversation(searchUser)}
                        >
                          <Avatar>
                            <AvatarFallback className={getRoleBadgeColor(searchUser.role)}>
                              {getInitials(searchUser.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{searchUser.name}</p>
                            <p className="text-sm text-gray-500">{getRoleLabel(searchUser.role)}</p>
                          </div>
                          <UserPlus className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  ) : userSearchTerm ? (
                    <p className="text-center text-gray-500 py-4">Aucun utilisateur trouvé</p>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      Tapez pour rechercher un utilisateur
                    </p>
                  )}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={fetchContacts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Liste des contacts */}
        <Card className="col-span-4 flex flex-col h-full">
          <CardHeader className="py-3 px-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            {filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'Aucun contact trouvé' : 'Aucune conversation'}
              </div>
            ) : (
              filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className={cn(
                    'flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b',
                    selectedContact?.id === contact.id && 'bg-blue-50 dark:bg-blue-950'
                  )}
                  onClick={() => selectContact(contact)}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className={getRoleBadgeColor(contact.role || contact.contact_role || '')}>
                        {getInitials(contact.name || contact.contact_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0">
                      <StatusIndicator isOnline={contact.isOnline} />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{contact.name || contact.contact_name}</span>
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(contact.lastMessageTime || contact.last_message_time || '')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {contact.lastMessage || contact.last_message}
                      </p>
                      {(contact.unreadCount || contact.unread_count || 0) > 0 && (
                        <Badge className="bg-blue-600 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {contact.unreadCount || contact.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </Card>

        {/* Zone de conversation */}
        <Card className="col-span-8 flex flex-col h-full">
          {selectedContact ? (
            <>
              {/* Header de la conversation */}
              <CardHeader className="py-3 px-4 border-b flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className={getRoleBadgeColor(selectedContact.role || selectedContact.contact_role || '')}>
                        {getInitials(selectedContact.name || selectedContact.contact_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0">
                      <StatusIndicator isOnline={selectedContact.isOnline} />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {selectedContact.name || selectedContact.contact_name}
                      <Badge className={getRoleBadgeColor(selectedContact.role || selectedContact.contact_role || '')} variant="outline">
                        {getRoleLabel(selectedContact.role || selectedContact.contact_role || '')}
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      {selectedContact.isOnline ? (
                        <><Circle className="h-2 w-2 fill-green-500 text-green-500" /> En ligne</>
                      ) : (
                        formatLastSeen(selectedContact.lastSeen)
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" align="end">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className={getRoleBadgeColor(selectedContact.role || selectedContact.contact_role || '')}>
                              {getInitials(selectedContact.name || selectedContact.contact_name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{selectedContact.name || selectedContact.contact_name}</h4>
                            <p className="text-sm text-gray-500">{selectedContact.email}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Statut:</span>
                            <Badge className={selectedContact.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {selectedContact.isOnline ? 'En ligne' : 'Hors ligne'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-gray-500">Rôle:</span>
                            <span>{getRoleLabel(selectedContact.role || selectedContact.contact_role || '')}</span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-8 text-gray-500">
                      Aucun message. Commencez la conversation !
                    </div>
                  ) : (
                    messages.map(message => {
                      const isOwn = String(message.senderId || message.sender_id) === String(user?.userId)
                      return (
                        <div
                          key={message.id}
                          className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                        >
                          <div className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2',
                            isOwn 
                              ? 'bg-blue-600 text-white rounded-br-md' 
                              : 'bg-gray-100 dark:bg-gray-800 rounded-bl-md'
                          )}>
                            <p>{message.content}</p>
                            <div className={cn(
                              'flex items-center justify-end gap-1 text-xs mt-1',
                              isOwn ? 'text-blue-200' : 'text-gray-500'
                            )}>
                              <span>{formatTime(message.createdAt || message.created_at || '')}</span>
                              {isOwn && (
                                (message.read || message.is_read)
                                  ? <CheckCheck className="h-3 w-3" />
                                  : <Check className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Zone de saisie */}
              <div className="p-4 border-t">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                  }}
                  className="flex items-center gap-2"
                >
                  <Button type="button" variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input 
                    placeholder="Écrivez votre message..." 
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button type="submit" disabled={!newMessage.trim() || sending}>
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-500 mt-1">
                  Choisissez un contact pour commencer à discuter
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
