import React, { useState, useEffect } from "react";

// LocalStorage keys
const STORAGE_KEY = {
  counter: "zunair_counter",
  submissions: "zunair_form_data"
};

function Counter({ count, inc, dec, reset }) {
  return (
    <div className="card">
      <h2>Counter</h2>

      <div className="counter-box">
        <button onClick={dec} aria-label="decrement">−</button>
        <span className="count">{count}</span>
        <button onClick={inc} aria-label="increment">+</button>
      </div>

      <button className="reset-btn" onClick={reset}>Reset</button>

      <small className="muted">Keyboard: ArrowUp = + | ArrowDown = − | R = reset</small>
    </div>
  );
}

function Form({ add }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError("Name and Email required");
      return;
    }

    const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailCheck.test(email)) {
      setError("Invalid email");
      return;
    }

    const data = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      notes: notes.trim(),
      time: new Date().toLocaleString()
    };

    add(data);
    setName("");
    setEmail("");
    setNotes("");
    setError("");
  }

  return (
    <div className="card">
      <h2>Form Handling</h2>

      <form onSubmit={submit}>
        <label>Name</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} />

        <label>Email</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} />

        <label>Notes</label>
        <textarea
          rows="3"
          value={notes}
          onChange={(e)=>setNotes(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

function Submissions({ list, remove }) {
  return (
    <div className="card">
      <h2>Submitted Data</h2>

      {(!list || list.length === 0) && <p className="muted">No submissions yet.</p>}

      <ul className="list">
        {list && list.map((x) => (
          <li key={x.id}>
            <strong>{x.name}</strong>
            <div><span className="muted">{x.email}</span></div>
            {x.notes && <p>{x.notes}</p>}
            <small className="muted">{x.time}</small>

            <div>
              <button className="delete" onClick={()=>remove(x.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  // Load saved counter
  const [count, setCount] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY.counter);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Load saved form submissions
  const [list, setList] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY.submissions);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Save counter
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY.counter, String(count));
    } catch {
      // ignore storage errors (e.g. private mode)
    }
  }, [count]);

  // Save form list
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY.submissions, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  }, [list]);

  // Keyboard shortcuts (safe)
  useEffect(() => {
    function keys(e) {
      // make safe: e.key might be undefined in some exotic events
      const raw = typeof e.key === "string" ? e.key : "";
      const key = raw.toLowerCase();

      if (key === "arrowup") {
        setCount(prev => prev + 1);
      } else if (key === "arrowdown") {
        setCount(prev => prev - 1);
      } else if (key === "r") {
        setCount(0);
      }
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, []);

  function addSubmission(data) {
    setList(prev => [data, ...prev]);
  }

  function deleteSubmission(id) {
    setList(prev => prev.filter(x => x.id !== id));
  }

  return (
    <div className="container">
      {/* Heading removed as requested. If you want a different heading, add it here */}
      <Counter
        count={count}
        inc={() => setCount(c => c + 1)}
        dec={() => setCount(c => c - 1)}
        reset={() => setCount(0)}
      />

      <Form add={addSubmission} />

      <Submissions list={list} remove={deleteSubmission} />
    </div>
  );
}