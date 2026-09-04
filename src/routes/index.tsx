import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import profileImage from "@/assets/profile.jpg";

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

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Can you tell me about your experience with design systems?",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Absolutely. I led the design system rebuild at Halcyon, unifying 3 product teams around 40+ shared components. Adoption grew 3x in one quarter and cut our design-to-dev handoff time by roughly 40%.",
  },
  {
    id: "3",
    role: "user",
    content: "And your approach to accessibility?",
  },
  {
    id: "4",
    role: "assistant",
    content:
      "Accessibility is a starting point, not a checklist. I bake WCAG AA into every token and run automated audits before ship. It's built into the system so it can't be quietly skipped.",
  },
];

const SUGGESTED_QUESTIONS = [
  "What's your leadership style?",
  "Which tools do you use daily?",
  "Where do you see yourself in 3 years?",
];

// Replace this with your backend call.
async function fetchAnswer(question: string): Promise<string> {
  // TODO: wire this to your backend endpoint
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return `Thanks for asking: "${question}". This is a placeholder answer — connect fetchAnswer to your backend to return real responses.`;
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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const answer = await fetchAnswer(question);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: answer,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, I couldn't reach the backend right now. Please try again.",
        },
      ]);
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
            A
          </span>
          <span className="truncate text-xs font-medium uppercase tracking-[0.2em] text-ink sm:text-sm">
            Ask Aria
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
              width={1024}
              height={1024}
              className="size-full object-cover"
            />
          </div>
          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
            Aria Bennett
          </h1>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-ember sm:text-sm sm:tracking-[0.25em]">
            Senior Product Designer
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/70 sm:text-base">
            Ask me anything — I'll answer about my work, skills, and experience
            as if we were in the room together.
          </p>
        </div>

        <div
          ref={threadRef}
          className="mb-8 flex max-h-[55vh] flex-col gap-4 overflow-y-auto scroll-smooth sm:mb-10 sm:max-h-[60vh] sm:gap-5"
        >

          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-xs rounded-2xl rounded-br-md bg-ember px-5 py-3.5 text-[15px] leading-relaxed text-cream shadow-[0_10px_30px_-12px_rgba(190,94,44,0.6)] md:max-w-md">
                  {message.content}
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex justify-start">
                <div className="max-w-md rounded-2xl rounded-bl-md border border-sand/50 bg-white/70 px-5 py-3.5 text-[15px] leading-relaxed text-ink md:max-w-lg">
                  {message.content}
                </div>
              </div>
            )
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-sand/50 bg-white/70 px-5 py-4">
                <span
                  className="size-1.5 animate-bounce rounded-full bg-ink/40"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="size-1.5 animate-bounce rounded-full bg-ink/40"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="size-1.5 animate-bounce rounded-full bg-ink/40"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 flex flex-wrap gap-2.5">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => handleSend(question)}
              className="rounded-full bg-dune px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-sand"
            >
              {question}
            </button>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-3 rounded-full border border-sand bg-white/80 px-5 py-2.5 shadow-[0_15px_40px_-20px_rgba(42,35,27,0.4)]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a question about Aria…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-full bg-ember px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-ember/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
