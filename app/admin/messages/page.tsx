'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare,
  Send,
  Search,
  Filter,
  User,
  Users,
  Plus,
  Star,
  StarOff,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreVertical,
  Paperclip,
  Clock,
  CheckCircle,
  Check,
  CheckCheck,
  Circle,
  Inbox,
  SendHorizonal,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

interface Message {
  id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  sender_role: string
  recipient_id: string
  recipient_name: string
  subject: string
  content: string
  is_read: boolean
  is_starred: boolean
  is_archived: boolean
  sent_at: string
  read_at?: string
  attachments: string[]
  reply_to?: string
}

interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  participant_role: string
  participant_avatar?: string
  last_message: string
  last_message_at: string
  unread_count: number
  is_online: boolean
}

interface UserOption {
  id: string
  name: string
  email: string
  role: string
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [users, setUsers] = useState<UserOption[]>([])
  const [sending, setSending] = useState(false)
  const messageEndRef = useRef<HTMLDivElement>(null)

  const [composeForm, setComposeForm] = useState({
    recipientId: '',
    recipientSearch: '',
    subject: '',
    content: '',
    isUrgent: false
  })

  // Stats
  const userId = user?.userId?.toString() || ''
  const stats = {
    inbox: messages.filter(m => !m.is_archived && m.recipient_id === userId).length,
    unread: messages.filter(m => !m.is_read && m.recipient_id === userId).length,
    sent: messages.filter(m => m.sender_id === userId).length,
    starred: messages.filter(m => m.is_starred).length,
    archived: messages.filter(m => m.is_archived).length
  }

  useEffect(() => {
    fetchMessages()
    fetchUsers()
  }, [activeTab])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?user_id=${user?.userId}&folder=${activeTab}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?limit=100')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users?.map((u: any) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
          email: u.email,
          role: u.role
        })) || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!composeForm.recipientId || !composeForm.content) {
      toast.error('Veuillez sélectionner un destinataire et écrire un message')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.userId,
          recipientId: composeForm.recipientId,
          subject: composeForm.subject,
          content: composeForm.content,
          isUrgent: composeForm.isUrgent
        })
      })

      if (response.ok) {
        toast.success('Message envoyé')
        setShowComposeDialog(false)
        setComposeForm({
          recipientId: '',
          recipientSearch: '',
          subject: '',
          content: '',
          isUrgent: false
        })
        fetchMessages()
      } else {
        toast.error("Erreur lors de l'envoi")
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setSending(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action: 'mark_read' })
      })
      fetchMessages()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleToggleStar = async (messageId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action: 'toggle_star' })
      })
      fetchMessages()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleArchive = async (messageId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action: 'archive' })
      })
      toast.success('Message archivé')
      fetchMessages()
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Supprimer ce message?')) return
    try {
      await fetch(`/api/messages?id=${messageId}`, {
        method: 'DELETE'
      })
      toast.success('Message supprimé')
      setSelectedMessage(null)
      fetchMessages()
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-red-100 text-red-700',
      'TEACHER': 'bg-blue-100 text-blue-700',
      'STUDENT': 'bg-green-100 text-green-700',
      'SECRETARY': 'bg-purple-100 text-purple-700'
    }
    return <Badge className={colors[role] || 'bg-gray-100 text-gray-700'}>{role}</Badge>
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
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

  const filteredMessages = messages.filter(msg => {
    if (activeTab === 'inbox') return msg.recipient_id === userId && !msg.is_archived
    if (activeTab === 'sent') return msg.sender_id === userId
    if (activeTab === 'starred') return msg.is_starred
    if (activeTab === 'archived') return msg.is_archived
    return true
  }).filter(msg =>
    msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(composeForm.recipientSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(composeForm.recipientSearch.toLowerCase())
  ).slice(0, 10)

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            {stats.unread} messages non lus
          </p>
        </div>
        <Button onClick={() => setShowComposeDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau message
        </Button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar */}
        <Card className="w-64 flex-shrink-0">
          <CardContent className="p-2">
            <nav className="space-y-1">
              <Button
                variant={activeTab === 'inbox' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('inbox')}
              >
                <Inbox className="h-4 w-4 mr-2" />
                Boîte de réception
                {stats.unread > 0 && (
                  <Badge className="ml-auto">{stats.unread}</Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'sent' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('sent')}
              >
                <SendHorizonal className="h-4 w-4 mr-2" />
                Envoyés
                <span className="ml-auto text-muted-foreground text-sm">{stats.sent}</span>
              </Button>
              <Button
                variant={activeTab === 'starred' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('starred')}
              >
                <Star className="h-4 w-4 mr-2" />
                Favoris
                <span className="ml-auto text-muted-foreground text-sm">{stats.starred}</span>
              </Button>
              <Button
                variant={activeTab === 'archived' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('archived')}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archives
                <span className="ml-auto text-muted-foreground text-sm">{stats.archived}</span>
              </Button>
            </nav>
          </CardContent>
        </Card>

        {/* Message List */}
        <Card className="w-80 flex-shrink-0 flex flex-col">
          <CardHeader className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Chargement...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Aucun message
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-muted' : ''
                  } ${!message.is_read && message.recipient_id === userId ? 'bg-primary/5' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (!message.is_read && message.recipient_id === userId) {
                      handleMarkAsRead(message.id)
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={message.sender_avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(activeTab === 'sent' ? message.recipient_name : message.sender_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${!message.is_read && message.recipient_id === userId ? 'font-semibold' : ''}`}>
                          {activeTab === 'sent' ? message.recipient_name : message.sender_name}
                        </p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDate(message.sent_at)}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${!message.is_read && message.recipient_id === userId ? 'font-medium' : 'text-muted-foreground'}`}>
                        {message.subject || '(Sans objet)'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {message.content.slice(0, 50)}...
                      </p>
                    </div>
                    {message.is_starred && (
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </Card>

        {/* Message Content */}
        <Card className="flex-1 flex flex-col min-w-0">
          {selectedMessage ? (
            <>
              <CardHeader className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedMessage.sender_avatar} />
                      <AvatarFallback>
                        {getInitials(selectedMessage.sender_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{selectedMessage.sender_name}</h3>
                        {getRoleBadge(selectedMessage.sender_role)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        À: {selectedMessage.recipient_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(selectedMessage.sent_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(selectedMessage.id)}
                    >
                      {selectedMessage.is_starred ? (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setComposeForm({
                          recipientId: selectedMessage.sender_id,
                          recipientSearch: selectedMessage.sender_name,
                          subject: `Re: ${selectedMessage.subject}`,
                          content: '',
                          isUrgent: false
                        })
                        setShowComposeDialog(true)
                      }}
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleArchive(selectedMessage.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archiver
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(selectedMessage.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <div className="p-4 border-b bg-muted/30">
                <h2 className="text-lg font-medium">
                  {selectedMessage.subject || '(Sans objet)'}
                </h2>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>
                
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      <Paperclip className="h-4 w-4 inline mr-1" />
                      {selectedMessage.attachments.length} pièce(s) jointe(s)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer">
                          {attachment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Répondre rapidement..."
                    className="resize-none"
                    rows={2}
                  />
                  <Button className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un message pour le lire</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Dialog Composer */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau message</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Destinataire *</Label>
              <div className="relative">
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={composeForm.recipientSearch}
                  onChange={(e) => setComposeForm({ ...composeForm, recipientSearch: e.target.value })}
                />
                {composeForm.recipientSearch && !composeForm.recipientId && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                        onClick={() => {
                          setComposeForm({
                            ...composeForm,
                            recipientId: u.id,
                            recipientSearch: u.name
                          })
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{getInitials(u.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        {getRoleBadge(u.role)}
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground">Aucun utilisateur trouvé</div>
                    )}
                  </div>
                )}
              </div>
              {composeForm.recipientId && (
                <Badge variant="secondary" className="mt-1">
                  {composeForm.recipientSearch}
                  <button 
                    className="ml-1"
                    onClick={() => setComposeForm({ ...composeForm, recipientId: '', recipientSearch: '' })}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>Objet</Label>
              <Input
                placeholder="Objet du message"
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                placeholder="Écrivez votre message..."
                value={composeForm.content}
                onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                rows={8}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgent"
                checked={composeForm.isUrgent}
                onChange={(e) => setComposeForm({ ...composeForm, isUrgent: e.target.checked })}
              />
              <Label htmlFor="urgent" className="text-sm cursor-pointer flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Marquer comme urgent
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSendMessage} disabled={sending}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
