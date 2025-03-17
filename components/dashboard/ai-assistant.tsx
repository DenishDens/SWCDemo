"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Send, X, Minimize2, ChevronUp, Loader2 } from "lucide-react"

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; timestamp: Date }[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant for carbon emissions tracking. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      role: "user" as const,
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      let response = ""

      if (inputValue.toLowerCase().includes("emission") || inputValue.toLowerCase().includes("carbon")) {
        response =
          "Based on your recent uploads, your total carbon emissions have decreased by 12.5% compared to last month. Would you like me to generate a detailed report on which areas have improved the most?"
      } else if (inputValue.toLowerCase().includes("report") || inputValue.toLowerCase().includes("analysis")) {
        response =
          "I can help you generate various reports including monthly summaries, trend analysis, and comparison reports. What specific information are you looking for?"
      } else if (inputValue.toLowerCase().includes("help") || inputValue.toLowerCase().includes("how")) {
        response =
          "I can help you with uploading data, analyzing emissions, generating reports, and providing insights to reduce your carbon footprint. Just let me know what you need assistance with!"
      } else {
        response =
          "I'm here to help with your carbon emissions tracking and analysis. You can ask me about your emissions data, how to reduce your carbon footprint, or how to use specific features of the platform."
      }

      const assistantMessage = {
        role: "assistant" as const,
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 shadow-lg flex items-center justify-center"
      >
        <Brain className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div
      className={`fixed ${isMinimized ? "bottom-6 right-6 w-auto" : "bottom-6 right-6 w-80 md:w-96"} z-50 transition-all duration-200 ease-in-out`}
    >
      {isMinimized ? (
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 shadow-lg flex items-center justify-center"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="shadow-xl border-gray-200">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-green-600 text-white rounded-t-lg">
            <div className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              <CardTitle className="text-base">AI Assistant</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-green-700 rounded-full"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-green-700 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message, index) => (
                <div key={index} className={`flex mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="bg-green-100 text-green-800">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] ${message.role === "user" ? "bg-green-600 text-white" : "bg-white border border-gray-200"} rounded-lg p-3`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === "user" ? "text-green-100" : "text-gray-500"}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 ml-2">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="bg-gray-200">JD</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback className="bg-green-100 text-green-800">AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500 mr-2" />
                      <p className="text-sm text-gray-500">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="p-3 border-t">
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700 px-3"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

