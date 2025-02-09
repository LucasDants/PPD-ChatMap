import { Send } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import { socket } from "@/services/socket"
import { meAtom, Message, usersAtom } from "@/store"
import { useAtom, useAtomValue } from "jotai"

type Props = React.HTMLAttributes<HTMLDivElement> & {
}

export function Chat({ className, ...rest }: Props) {
  const me = useAtomValue(meAtom)
  const [users, setUsers] = useAtom(usersAtom)

  const chatId = me.activeChatUserId

  const activeChatUser = users.find(user => user.id === chatId)
  const chatMessages = useMemo(() => activeChatUser?.messages ?? [], [activeChatUser])

  const chatRef = useRef<HTMLDivElement>(null)

  function handleSubmitMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)

    const messageContent = formData.get("message") as string

    if (messageContent.length === 0 || activeChatUser == null) return

    const message = {
      id: Math.random().toString(),
      from: me.id,
      to: activeChatUser.id,
      content: messageContent,
      createdAt: new Date().toISOString()
    }

    setUsers(prev => {
      const newUsers = prev.map(user => {
        if (user.id === activeChatUser.id) {
          return {
            ...user,
            messages: [...user.messages, message]
          }
        }

        return user
      })
      return newUsers
    })

    form.reset()
    socket.emit("message", message)
  }

  useEffect(() => {
    socket.on('message', (message: Message) => {
      setUsers(prev => {
        const newUsers = prev.map(user => {
          if (user.id === message.from) {
            return {
              ...user,
              messages: [...user.messages, message]
            }
          }

          return user
        })
        return newUsers
      })
    });

    return () => {
      socket.off('message');
    };
  }, [setUsers]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current?.scrollHeight + 20;
    }
  }, [chatMessages])

  return (
    <Card className={cn("h-screen flex flex-col rounded-none min-w-96", className)} {...rest}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <p className="text-sm font-medium leading-none">Chat</p>
          <p className="text-sm text-muted-foreground">Talking to {activeChatUser?.username ?? "yourself"}</p>
        </div>
        <div className="flex flex-row items-center space-x-4">
          {/* {piece != null &&
            <Button className="p-1 disabled:opacity-100" size="icon" type="button" onClick={handleGiveUp} disabled>
              <BoardPiece piece={piece} />
              <span className="sr-only">Piece {Piece[piece]}</span>
            </Button>
          } */}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-scroll" ref={chatRef}>
        <div className="space-y-4">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                message.from === me.id && "ml-auto bg-primary text-primary-foreground",
                message.from !== me.id && "bg-[#2563EB] text-[#0f172a]"
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={handleSubmitMessage}
          className="flex w-full items-center space-x-2 pt-2"
        >
          <Input
            id="message"
            name="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={activeChatUser == null}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}