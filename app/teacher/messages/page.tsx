'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Send, Plus, Loader2, RefreshCw, UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

interface Conversation {
  contact_id: number
  contact_name: string
  contact_role: string
  last_message: string
  last_message_time: string
  unread_count: number
}

interface Message {
  id: number
  sender_id: number
  sender_name: string
  receiver_id: number
  content: string
  created_at: string
  is_read: boolean
}

interface User {
  id: number
  name: string
  first_name?: string
  last_name?: string
  role: string
}

export default function TeacherMessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [searchUsers, setSearchUsers] = useState<User[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [searchingUsers, setSearchingUsers] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  

  // Récupérer l'ID de l'utilisateur connecté
  const currentUserId = user?.userId ? parseInt(user.userId) : null

  // Récupérer les conversations
  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return
    
    try {
      const response = await fetch(`/api/messages?user_id=${currentUserId}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Erreur récupération conversations:', error)
      toast.error('Impossible de charger les conversations')
    } finally {
      setLoading(false)
    }
  }, [currentUserId, toast])

  // Récupérer les messages d'une conversation
  const fetchMessages = useCallback(async (contactId: number) => {
    if (!currentUserId) return
    
    try {
      const response = await fetch(
        `/api/messages?user_id=${currentUserId}&contact_id=${contactId}&type=messages`
      )
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        
        // Marquer les messages comme lus
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: contactId,
            receiverId: currentUserId
          })
        })
      }
    } catch (error) {
      console.error('Erreur récupération messages:', error)
    }
  }, [currentUserId])

  // Charger les conversations au démarrage
  useEffect(() => {
    if (currentUserId) {
      fetchConversations()
    }
  }, [currentUserId, fetchConversations])

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.contact_id)
    }
  }, [selectedConversation, fetchMessages])

  // Scroll automatique vers le bas des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Polling pour rafraîchir les messages toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUserId) {
        fetchConversations()
        if (selectedConversation) {
          fetchMessages(selectedConversation.contact_id)
        }
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }, [currentUserId, selectedConversation, fetchConversations, fetchMessages])

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return
    
    setSendingMessage(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: selectedConversation.contact_id,
          content: newMessage.trim()
        })
      })
      
      if (response.ok) {
        setNewMessage('')
        fetchMessages(selectedConversation.contact_id)
        fetchConversations()
      } else {
        throw new Error('Erreur envoi message')
      }
    } catch (error) {
      console.error('Erreur envoi message:', error)
      toast.error('Impossible d\'envoyer le message')
    } finally {
      setSendingMessage(false)
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
  const startNewConversation = (searchedUser: User) => {
    const userName = searchedUser.name || `${searchedUser.first_name || ''} ${searchedUser.last_name || ''}`.trim()
    const newConv: Conversation = {
      contact_id: searchedUser.id,
      contact_name: userName,
      contact_role: searchedUser.role,
      last_message: '',
      last_message_time: new Date().toISOString(),
      unread_count: 0
    }
    setSelectedConversation(newConv)
    setMessages([])
    setShowNewMessageDialog(false)
    setUserSearchTerm('')
    setSearchUsers([])
  }

  // Obtenir le nom complet d'un utilisateur
  const getUserName = (u: User) => {
    return u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim()
  }

  // Formater la date/heure
  const formatTime = (dateString: string) => {
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
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }
  }

  // Obtenir les initiales d'un nom
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Filtrer les conversations par recherche
  const filteredConversations = conversations.filter(conv =>
    conv.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Communiquez avec vos étudiants et l'administration
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchConversations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Liste des conversations */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouvelle conversation</DialogTitle>
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
                          {searchUsers.map((searchedUser) => (
                            <div
                              key={searchedUser.id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                              onClick={() => startNewConversation(searchedUser)}
                            >
                              <Avatar>
                                <AvatarFallback>{getInitials(getUserName(searchedUser))}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{getUserName(searchedUser)}</p>
                                <p className="text-sm text-gray-500">{searchedUser.role}</p>
                              </div>
                              <UserPlus className="h-4 w-4 ml-auto text-gray-400" />
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
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <div className="divide-y">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.contact_id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedConversation?.contact_id === conv.contact_id
                        ? 'bg-gray-50 dark:bg-gray-800'
                        : ''
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(conv.contact_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{conv.contact_name}</p>
                          <span className="text-xs text-gray-500">
                            {formatTime(conv.last_message_time)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                          {conv.unread_count > 0 && (
                            <Badge className="ml-2">{conv.unread_count}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Zone de chat */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(selectedConversation.contact_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedConversation.contact_name}</CardTitle>
                    <p className="text-sm text-gray-500">{selectedConversation.contact_role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Aucun message. Commencez la conversation !
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.sender_id === currentUserId
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMe ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    disabled={sendingMessage}
                  />
                  <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Sélectionnez une conversation ou créez-en une nouvelle
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
