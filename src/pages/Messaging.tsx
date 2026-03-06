import { useState } from "react";
import { MessageSquare, Send, Check, CheckCheck, Search } from "lucide-react";

interface Message {
  id: string;
  sender: "me" | "other";
  text: string;
  time: string;
  read: boolean;
}

interface Conversation {
  id: string;
  contactName: string;
  propertyTitle: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  avatar: string;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    contactName: "Karwan Mohammed",
    propertyTitle: "Luxury Villa with Pool",
    lastMessage: "Is the pool heated?",
    lastTime: "2 min ago",
    unread: 2,
    avatar: "KM",
    messages: [
      { id: "m1", sender: "other", text: "Hi, I'm interested in the Luxury Villa listing.", time: "10:30 AM", read: true },
      { id: "m2", sender: "me", text: "Hello! Yes, it's still available. Would you like to schedule a viewing?", time: "10:32 AM", read: true },
      { id: "m3", sender: "other", text: "That would be great. Also, is the pool heated?", time: "10:45 AM", read: false },
      { id: "m4", sender: "other", text: "And what about the smart home system — which brand?", time: "10:46 AM", read: false },
    ],
  },
  {
    id: "conv-2",
    contactName: "Sara Development Co.",
    propertyTitle: "Modern Apartment - City Center",
    lastMessage: "Documents are ready for review.",
    lastTime: "1 hour ago",
    unread: 0,
    avatar: "SD",
    messages: [
      { id: "m5", sender: "me", text: "Hi Sara, any update on the documentation?", time: "9:00 AM", read: true },
      { id: "m6", sender: "other", text: "Documents are ready for review.", time: "9:15 AM", read: true },
    ],
  },
  {
    id: "conv-3",
    contactName: "Aya Mohammed",
    propertyTitle: "Penthouse - Panoramic Views",
    lastMessage: "I'd like to make an offer.",
    lastTime: "Yesterday",
    unread: 1,
    avatar: "AM",
    messages: [
      { id: "m7", sender: "other", text: "Hello, the penthouse looks amazing!", time: "Yesterday", read: true },
      { id: "m8", sender: "me", text: "Thank you! It's one of our best listings.", time: "Yesterday", read: true },
      { id: "m9", sender: "other", text: "I'd like to make an offer.", time: "Yesterday", read: false },
    ],
  },
];

export default function Messaging() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConv, setActiveConv] = useState(conversations[0].id);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  const active = conversations.find((c) => c.id === activeConv)!;
  const filtered = conversations.filter(
    (c) => c.contactName.toLowerCase().includes(search.toLowerCase()) ||
           c.propertyTitle.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msg: Message = {
      id: `m-${Date.now()}`,
      sender: "me",
      text: newMessage.trim(),
      time,
      read: false,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv
          ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text, lastTime: "Just now" }
          : c
      )
    );
    setNewMessage("");
  };

  const selectConversation = (id: string) => {
    setActiveConv(id);
    // Mark messages as read
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, unread: 0, messages: c.messages.map((m) => ({ ...m, read: true })) }
          : c
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" /> Messages
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Conversations per property — Pro+ feature.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Conversation list */}
        <div className="rounded-xl bg-card border border-border overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/30 text-foreground text-sm placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left p-4 border-b border-border transition-colors ${
                  activeConv === conv.id ? "bg-primary/5" : "hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                    {conv.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-sm truncate">{conv.contactName}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{conv.lastTime}</span>
                    </div>
                    <p className="text-xs text-primary/70 mt-0.5">{conv.propertyTitle}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold min-w-[20px] text-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary-foreground">
              {active.avatar}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{active.contactName}</p>
              <p className="text-xs text-primary/70">{active.propertyTitle}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {active.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/30 text-foreground rounded-bl-md"
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${
                    msg.sender === "me" ? "text-primary-foreground/60 justify-end" : "text-muted-foreground"
                  }`}>
                    {msg.time}
                    {msg.sender === "me" && (
                      msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-muted/30 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                onClick={sendMessage}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
