'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Send, MessageSquare, Plus } from 'lucide-react'

const mockConversations = [
  {
    id: 1,
    name: 'MBUYI Jean',
    role: 'Étudiant',
    lastMessage: 'Professeur, j\'ai une question concernant le TP...',
    time: '10:30',
    unread: 2,
    avatar: 'MJ'
  },
  {
    id: 2,
    name: 'Secrétariat Faculté',
    role: 'Administration',
    lastMessage: 'Veuillez soumettre les notes avant vendredi',
    time: 'Hier',
    unread: 0,
    avatar: 'SF'
  },
  {
    id: 3,
    name: 'KABONGO Marie',
    role: 'Étudiant',
    lastMessage: 'Merci pour votre réponse',
    time: 'Lun',
    unread: 0,
    avatar: 'KM'
  },
]

const mockMessages = [
  {
    id: 1,
    sender: 'MBUYI Jean',
    content: 'Bonjour Professeur, j\'espère que vous allez bien.',
    time: '10:25',
    isMe: false
  },
  {
    id: 2,
    sender: 'Moi',
    content: 'Bonjour Jean, oui merci. Que puis-je faire pour vous?',
    time: '10:27',
    isMe: true
  },
  {
    id: 3,
    sender: 'MBUYI Jean',
    content: 'Professeur, j\'ai une question concernant le TP de la semaine dernière. Je n\'arrive pas à comprendre la partie sur les pointeurs.',
    time: '10:30',
    isMe: false
  },
]

export default function TeacherMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [newMessage, setNewMessage] = useState('')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Communiquez avec vos étudiants et l'administration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations list */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Rechercher..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <div className="divide-y">
              {mockConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedConversation.id === conv.id ? 'bg-gray-50 dark:bg-gray-800' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{conv.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">{conv.name}</p>
                        <span className="text-xs text-gray-500">{conv.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <Badge className="ml-2">{conv.unread}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat area */}
        <Card className="md:col-span-2 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{selectedConversation.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                <p className="text-sm text-gray-500">{selectedConversation.role}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-4">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isMe
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${message.isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
