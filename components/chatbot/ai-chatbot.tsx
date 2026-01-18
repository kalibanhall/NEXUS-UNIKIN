'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2,
  Maximize2,
  Trash2,
  Sparkles,
  Loader2,
  GraduationCap,
  BookOpen,
  Calendar,
  HelpCircle,
  FileText,
  Globe,
  ExternalLink,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface WebSource {
  title: string
  snippet: string
  url: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  sources?: WebSource[]
}

interface QuickAction {
  icon: typeof BookOpen
  label: string
  prompt: string
}

const quickActions: QuickAction[] = [
  { icon: Calendar, label: 'Emploi du temps', prompt: 'Quel est mon emploi du temps ?' },
  { icon: BookOpen, label: 'Cours', prompt: 'Quels sont mes cours ?' },
  { icon: FileText, label: 'Notes', prompt: 'Quelles sont mes notes ?' },
  { icon: GraduationCap, label: 'UNIKIN', prompt: 'Parle-moi de l\'UNIKIN' },
  { icon: Search, label: 'Recherche', prompt: 'Recherche sur internet les actualités de l\'UNIKIN' },
]

const initialSuggestions = [
  "Parle-moi de l'UNIKIN",
  "Quelles sont les facultés ?",
  "Comment s'inscrire ?",
  "Frais de scolarité"
]

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Message de bienvenue initial
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Bonjour ! 👋 Je suis **NEXUS Assistant**, votre assistant IA universitaire. Je peux vous aider avec :\n\n• Vos cours et emploi du temps\n• Vos notes et évaluations\n• Les procédures administratives\n• La navigation sur la plateforme\n\nComment puis-je vous aider aujourd'hui ?",
        timestamp: new Date(),
        suggestions: initialSuggestions
      }])
    }
  }, [])

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim()
    if (!messageText || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        timestamp: new Date(),
        suggestions: data.suggestions,
        sources: data.sources
      }

      setMessages(prev => [...prev, assistantMessage])
      
      if (!isOpen || isMinimized) {
        setHasNewMessage(true)
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: "Conversation effacée. Comment puis-je vous aider ?",
      timestamp: new Date(),
      suggestions: initialSuggestions
    }])
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
    setHasNewMessage(false)
  }

  const formatMessage = (content: string) => {
    // Support basique du markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ')
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={toggleOpen}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center",
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
          "text-white hover:scale-110",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageCircle className="w-6 h-6" />
        {hasNewMessage && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Fenêtre du chatbot */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
          isMinimized ? "w-80 h-14" : "w-96 h-[600px] max-h-[80vh]"
        )}
      >
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">NEXUS Assistant</h3>
                <p className="text-xs text-blue-100">IA Universitaire • En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={clearChat}
                title="Effacer la conversation"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={toggleOpen}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Actions rapides */}
              <div className="px-3 py-2 bg-gray-50 border-b flex gap-2 overflow-x-auto scrollbar-hide">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(action.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 
                             hover:border-blue-300 hover:bg-blue-50 transition-colors text-xs whitespace-nowrap"
                  >
                    <action.icon className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Zone de messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === 'user' ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <Avatar className={cn(
                        "w-8 h-8 flex-shrink-0",
                        message.role === 'assistant' 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600" 
                          : "bg-gray-200"
                      )}>
                        <AvatarFallback className="bg-transparent">
                          {message.role === 'assistant' 
                            ? <Bot className="w-4 h-4 text-white" />
                            : <User className="w-4 h-4 text-gray-600" />
                          }
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={cn(
                        "max-w-[80%] space-y-2",
                        message.role === 'user' ? "items-end" : "items-start"
                      )}>
                        <div
                          className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm",
                            message.role === 'user'
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-800 rounded-bl-md"
                          )}
                          dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                        />
                        
                        {/* Sources web */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                              <Globe className="w-3 h-3" />
                              <span className="font-medium">Sources web</span>
                            </div>
                            <div className="space-y-1.5">
                              {message.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{source.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSend(suggestion)}
                                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full
                                         hover:border-blue-300 hover:bg-blue-50 transition-colors text-gray-600"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <p className={cn(
                          "text-[10px] text-gray-400",
                          message.role === 'user' ? "text-right" : "text-left"
                        )}>
                          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Indicateur de frappe */}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <AvatarFallback className="bg-transparent">
                          <Bot className="w-4 h-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-md">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Zone de saisie */}
              <div className="p-3 border-t bg-white">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Posez votre question..."
                      className="pr-10 rounded-full border-gray-200 focus:border-blue-400"
                      disabled={isLoading}
                    />
                    <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  </div>
                  <Button
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                    className="rounded-full bg-blue-600 hover:bg-blue-700 h-10 w-10"
                  >
                    {isLoading 
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Propulsé par IA • NEXUS UNIKIN
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
