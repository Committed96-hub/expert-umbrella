import { useRealCity } from "../real/RealCity";
import { useState } from "react";
import { Sparkles, ArrowUpRight, Send } from "lucide-react";
import { assistant } from "../repository";
import type { Entry } from "../data";
export function AssistantPanel({
  entries,
  notify,
}: {
  entries: Entry[];
  notify: (message: string) => void;
}) {
  const real = useRealCity();
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    [],
  );
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  async function ask(text = prompt) {
    if (!text.trim() || busy) return;
    setPrompt("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const words = text
        .toLocaleLowerCase("ru")
        .split(/\s+/)
        .filter((w) => w.length > 2);
      const matches =
        real.data?.objects
          .filter((o) =>
            words.some((w) =>
              `${o.title} ${o.category} ${Object.values(o.fields).join(" ")}`
                .toLocaleLowerCase("ru")
                .includes(w),
            ),
          )
          .slice(0, 3) || [];
      const answer = matches.length
        ? `По реестру источников: ${matches.map((o) => `${o.title}: ${o.fields.Адрес || o.summary} Источник: ${o.sources[0].url}; проверка ${o.verifiedAt}; ${o.status === "partial" ? "часть сведений уточняется" : o.status === "archived" ? "архив" : "подтверждено источником"}`).join("\n\n")} Это поиск по проверяемым карточкам, без языковой модели. Текущие цены и доступность уточняйте у источника.`
        : await assistant.reply(text, entries);
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch {
      notify("Не удалось получить ответ");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="assistant-panel">
      <div className="assistant-intro">
        <div className="ai-symbol">
          <Sparkles size={32} />
        </div>
        <h2>Привет! Что найдём сегодня?</h2>
        <p>
          Задайте вопрос или выберите одну из подсказок.
          <br />
          Поиск по реальным карточкам с источниками и отдельному демокаталогу.
        </p>
        <div className="suggestions">
          {[
            "Киноцентр Нейва",
            "Адрес Solo",
            "Найти мастера по ремонту",
            "Где выпить кофе?",
            "Что отдают бесплатно?",
          ].map((x) => (
            <button key={x} onClick={() => ask(x)}>
              {x}
              <ArrowUpRight size={14} />
            </button>
          ))}
        </div>
      </div>
      <div className="messages" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <small>{m.role === "user" ? "Вы" : "Помощник · демо"}</small>
            <p>{m.text}</p>
          </div>
        ))}
        {busy && <p>Подбираем варианты…</p>}
      </div>
      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input
          aria-label="Вопрос помощнику"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Например, нужен мастер для сборки мебели"
          maxLength={500}
        />
        <button
          className="primary"
          disabled={busy || !prompt.trim()}
          aria-label="Отправить вопрос"
        >
          <Send size={18} />
        </button>
      </form>
      <small className="demo-note">
        Без подключения к ИИ-модели. REAL-карточки сопровождаются источниками;
        предложения DEMO не являются реальными.
      </small>
    </div>
  );
}
