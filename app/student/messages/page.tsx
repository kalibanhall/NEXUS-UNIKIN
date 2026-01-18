'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, Send, Search, Plus, MoreVertical, 
  Phone, Video, Info, Smile, Paperclip, Image,
  Check, CheckCheck, Circle, User, Users, RefreshCw
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
  name: string
  email: string
  role: string
  avatar?: string
  isOnline: boolean
  lastSeen?: string
  unreadCount?: number
  lastMessage?: string
  lastMessageTime?: string
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read: boolean
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

export default function StudentMessagesPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Données de démonstration
  const demoContacts: Contact[] = [
    { 
      id: '1', 
      name: 'Prof. Jean Mukendi', 
      email: 'PROF-2020-001@unikin.ac.cd', 
      role: 'TEACHER',
      isOnline: true,
      lastMessage: 'Le cours de demain est reporté.',
      lastMessageTime: '10:30',
      unreadCount: 2
    },
    { 
      id: '2', 
      name: 'Prof. Marie Kabongo', 
      email: 'PROF-2020-002@unikin.ac.cd', 
      role: 'TEACHER',
      isOnline: false,
      lastSeen: '2026-01-15 14:30',
      lastMessage: 'N\'oubliez pas le TP de vendredi.',
      lastMessageTime: 'Hier'
    },
    { 
      id: '3', 
      name: 'Secrétariat Fac. Sciences', 
      email: 'secretariat@unikin.ac.cd', 
      role: 'EMPLOYEE',
      isOnline: true,
      lastMessage: 'Votre attestation est prête.',
      lastMessageTime: '09:15',
      unreadCount: 1
    },
    { 
      id: '4', 
      name: 'Paul Mbuyi', 
      email: 'ETU-2025-002@unikin.ac.cd', 
      role: 'STUDENT',
      isOnline: false,
      lastSeen: '2026-01-15 16:00',
      lastMessage: 'Tu as les notes du cours?',
      lastMessageTime: 'Lun'
    },
    { 
      id: '5', 
      name: 'Admin UNIKIN', 
      email: 'ADM-2024-001@unikin.ac.cd', 
      role: 'ADMIN',
      isOnline: true,
      lastMessage: 'Bienvenue sur la plateforme!',
      lastMessageTime: '12 Jan'
    },
  ]

  const demoMessages: Message[] = [
    { id: '1', senderId: '1', receiverId: String(user?.id || ''), content: 'Bonjour! J\'espère que vous allez bien.', createdAt: '2026-01-15T08:00:00', read: true, type: 'text' },
    { id: '2', senderId: String(user?.id || ''), receiverId: '1', content: 'Bonjour Professeur! Oui très bien merci.', createdAt: '2026-01-15T08:05:00', read: true, type: 'text' },
    { id: '3', senderId: '1', receiverId: String(user?.id || ''), content: 'Je voulais vous informer que le cours de demain est reporté à jeudi.', createdAt: '2026-01-15T08:10:00', read: true, type: 'text' },
    { id: '4', senderId: '1', receiverId: String(user?.id || ''), content: 'Le cours de demain est reporté.', createdAt: '2026-01-15T10:30:00', read: false, type: 'text' },
  ]

  useEffect(() => {
    fetchContacts()
    // Mise à jour du statut en ligne
    updateOnlineStatus()
    const interval = setInterval(updateOnlineStatus, 30000) // Heartbeat toutes les 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      // En production, appeler l'API
      // const response = await fetch(`/api/messages?user_id=${user?.id}`)
      setContacts(demoContacts)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOnlineStatus = async () => {
    try {
      await fetch('/api/user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, status: 'ONLINE' })
      })
    } catch (error) {
      // Silently fail
    }
  }

  const fetchMessages = async (contactId: string) => {
    // En production, appeler l'API
    const filtered = demoMessages.filter(m => 
      m.senderId === contactId || m.receiverId === contactId
    )
    setMessages(filtered)
  }

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact)
    fetchMessages(contact.id)
    // Marquer comme lu
    setContacts(prev => prev.map(c => 
      c.id === contact.id ? { ...c, unreadCount: 0 } : c
    ))
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return
    
    setSending(true)
    try {
      // En production, appeler l'API
      const newMsg: Message = {
        id: Date.now().toString(),
        senderId: String(user?.id || ''),
        receiverId: selectedContact.id,
        content: newMessage,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'text'
      }
      setMessages(prev => [...prev, newMsg])
      setNewMessage('')
      
      // Mettre à jour le dernier message dans la liste des contacts
      setContacts(prev => prev.map(c => 
        c.id === selectedContact.id 
          ? { ...c, lastMessage: newMessage, lastMessageTime: 'À l\'instant' }
          : c
      ))
      
      toast.success('Message envoyé')
    } catch (error) {
      toast.error('Erreur d\'envoi')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
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

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
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
            {filteredContacts.map(contact => (
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
                    <AvatarFallback className={getRoleBadgeColor(contact.role)}>
                      {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0">
                    <StatusIndicator isOnline={contact.isOnline} />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{contact.name}</span>
                    <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                    {contact.unreadCount ? (
                      <Badge className="bg-blue-600 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {contact.unreadCount}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
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
                      <AvatarFallback className={getRoleBadgeColor(selectedContact.role)}>
                        {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0">
                      <StatusIndicator isOnline={selectedContact.isOnline} />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {selectedContact.name}
                      <Badge className={getRoleBadgeColor(selectedContact.role)} variant="outline">
                        {getRoleLabel(selectedContact.role)}
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
                            <AvatarFallback className={getRoleBadgeColor(selectedContact.role)}>
                              {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{selectedContact.name}</h4>
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
                            <span>{getRoleLabel(selectedContact.role)}</span>
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
                  {messages.map(message => {
                    const isOwn = message.senderId === String(user?.id)
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
                            <span>{formatTime(message.createdAt)}</span>
                            {isOwn && (
                              message.read 
                                ? <CheckCheck className="h-3 w-3" />
                                : <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Zone de saisie */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input 
                    placeholder="Écrivez votre message..." 
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button onClick={sendMessage} disabled={!newMessage.trim() || sending}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
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
