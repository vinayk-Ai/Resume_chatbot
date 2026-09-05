import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import profileImage from "@/assets/profile1.jpg";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Ask Aria · Resume Chatbot" },
      {
        name: "description",
        content:
          "Chat with Aria Bennett about her experience, skills, and work. A modern resume Q&A for recruiters and hiring teams.",
      },
      { property: "og:title", content: "Ask Aria · Resume Chatbot" },
      {
        property: "og:description",
        content:
          "Chat with Aria Bennett about her experience, skills, and work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGES: Message[] = [{ id: "1", role: "user", content: "Tell me about yourself.", },
{ id: "2", role: "assistant", content: "I'm Vinay Kumar, a Full Stack AI Engineer with a background in Computer Science and Artificial Intelligence. I enjoy building full-stack applications and integrating AI and machine learning into practical products.", },];

const SUGGESTED_QUESTIONS = ["Tell me about yourself.",
  "What are your key skills and technologies?",
  "Can you tell me about your projects and experience?",];
// Replace this with your backend call.
async function fetchAnswer(
  question: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch("http://127.0.0.1:8000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
    }),
  });

  if (!response.ok) {
    throw new Error("Backend request failed");
  }

  if (!response.body) {
    throw new Error("Streaming is not supported");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    if (chunk) {
      onChunk(chunk);
    }
  }
  const finalChunk = decoder.decode();

  if (finalChunk) {
    onChunk(finalChunk);
  }
}



function Index() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    const question = text.trim();

    if (!question || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    const assistantId = crypto.randomUUID();

    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      assistantMessage,
    ]);

    setInput("");
    setIsLoading(true);

    try {
      await fetchAnswer(question, (chunk) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? {
                ...message,
                content: message.content + chunk,
              }
              : message
          )
        );
      });
    } catch (error) {
      console.error(error);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
              ...message,
              content:
                "Sorry, I couldn't reach the backend right now. Please try again.",
            }
            : message
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="min-h-screen bg-cream font-body antialiased">
      <header className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-sand/60 px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-10">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="shrink-0 font-display text-lg text-ember sm:text-xl">
            V
          </span>
          <span className="truncate text-xs font-medium uppercase tracking-[0.2em] text-ink sm:text-sm">
            Ask Vinay
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="size-2 rounded-full bg-honey"></span>
          <span className="text-[11px] text-ink/60 sm:text-xs">
            Available now
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-12">
          <div className="mb-5 grid size-24 place-items-center overflow-hidden rounded-full bg-dune outline outline-1 -outline-offset-1 outline-black/5 sm:mb-6 sm:size-32 md:size-36">
            <img
              src={profileImage}
              alt="Aria Bennett"
              width={900}
              height={1406}
              className="size-full object-cover"
            />
          </div>
          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
            Vinay Kumar
          </h1>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-ember sm:text-sm sm:tracking-[0.25em]">
            Full Stack AI Engineer
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/70 sm:text-base">
            Ask me anything — I'll answer about my work, skills, and experience
            as if we were in the room together.
          </p>
        </div>


        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[85%] break-words rounded-2xl rounded-br-md bg-ember px-4 py-3 text-[15px] leading-relaxed text-cream">
                {message.content}
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex justify-start">
              <div className="max-w-[85%] break-words rounded-2xl rounded-bl-md border border-sand/50 bg-white/70 px-4 py-3 text-[15px] leading-relaxed text-ink sm:max-w-md">

                <div className="whitespace-pre-wrap">
                <ReactMarkdown>
                       {message.content}
                </ReactMarkdown>
                 
                </div>

                {isLoading &&
                  message.id === messages[messages.length - 1]?.id && (
                    <span className="ml-1 inline-block animate-pulse">▌</span>
                  )}

              </div>
            </div>
          )
        )}

        <div className="mb-6 flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mb-8 sm:flex-wrap sm:gap-2.5 sm:overflow-visible">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => handleSend(question)}
              disabled={isLoading}
              className="shrink-0 snap-start whitespace-nowrap rounded-full bg-dune px-4 py-2 text-[13px] text-ink/70 transition-colors hover:bg-sand sm:whitespace-normal sm:text-sm"
            >
              {question}
            </button>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="sticky bottom-3 flex items-center gap-2 rounded-full border border-sand bg-white/90 px-3 py-2 shadow-[0_15px_40px_-20px_rgba(42,35,27,0.4)] backdrop-blur sm:gap-3 sm:px-5 sm:py-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a question about Aria…"
            className="min-w-0 flex-1 bg-transparent px-2 text-base text-ink placeholder:text-ink/40 focus:outline-none sm:text-[15px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 rounded-full bg-ember px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-ember/90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-2.5"
          >
            Send
          </button>
        </form>

      </main>
    </div>
  );
}
