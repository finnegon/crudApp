import { useState } from "react";

const STATUS_LABEL = (status) => {
  if (status === 0) return "network";
  if (status < 300) return "success";
  if (status < 400) return "redirect";
  if (status < 500) return "client";
  return "server";
};

export default function RequestLog({ entries, onClear }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="card log">
      <header className="card-head">
        <div>
          <h2>Request log</h2>
          <p className="muted">Newest first · click a row for the response</p>
        </div>
        <button className="btn ghost" onClick={onClear} disabled={!entries.length}>
          Clear
        </button>
      </header>

      {entries.length === 0 ? (
        <p className="empty">Requests you make will show up here.</p>
      ) : (
        <ul className="log-list">
          {entries.map((entry, index) => {
            const isOpen = openIndex === index;
            return (
              <li key={entry.id}>
                <button
                  className="log-row"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span className={`method ${entry.method.toLowerCase()}`}>
                    {entry.method}
                  </span>
                  <span className="mono small path">{entry.url}</span>
                  <span className={`status ${STATUS_LABEL(entry.status)}`}>
                    {entry.status || "ERR"}
                  </span>
                  <span className="mono small muted ms">{entry.ms} ms</span>
                </button>

                {isOpen && (
                  <pre className="response">
                    {JSON.stringify(entry.data, null, 2)}
                  </pre>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
