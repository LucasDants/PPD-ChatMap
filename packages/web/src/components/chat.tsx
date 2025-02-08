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
import { meAtom, usersAtom } from "@/store"
import { useAtom, useAtomValue } from "jotai"

type Props = React.HTMLAttributes<HTMLDivElement> & {
}

type Message = {
  sessionId: string | null
  role: "player" | "system"
  content: string
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

    const message = formData.get("message") as string

    if (message.length === 0 || activeChatUser == null) return

    setUsers(prev => {
      const newUsers = [...prev]
      const userIndex = newUsers.findIndex(user => user.id === chatId)

      newUsers[userIndex].messages.push({
        id: crypto.randomUUID(),
        userId: me.id,
        content: message,
        status: "sent",
        createdAt: new Date().toISOString()
      })

      return newUsers
    })

    // TODO: Send socket event to update messages
  }

  // useEffect(() => {
  //   const sub = trpc.onGameChange.subscribe({ roomId, sessionId }, {
  //     onData(data) {
  //       setMessages(data.room.messages)
  //     },
  //     onError(err) {
  //       console.error("error", err);
  //     },
  //   })

  //   return () => {
  //     sub.unsubscribe()
  //   };
  // }, []);

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
                message.userId === me.id && "ml-auto bg-primary text-primary-foreground",
                message.userId !== me.id && "bg-muted"
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
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}