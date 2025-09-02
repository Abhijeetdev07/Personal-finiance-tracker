// import { useState } from 'react'
// import { useEffect, useState } from "react";

// export default function App() {

//   const [message, setMessage] = useState("");
  
//   useEffect(() => {
//     fetch("http://localhost:5000/api/test")
//       .then(res => res.json())
//       .then(data => setMessage(data.message));
//   }, []);

//   return (
//     <div className="min-h-screen bg-smoky flex items-center justify-center">
//       <h1 className="text-4xl font-bold text-primary">
//         Personal Finance Tracker
//       </h1>
//       <p className="text-gray-700">{message}</p>
//     </div>
//   );
// }


import { useEffect, useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/test");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMessage(data.message);
      } catch (e) {
        setErr(e.message);
        console.error("Fetch error:", e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-smoky flex flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold text-primary">Personal Finance Tracker</h1>
      {message && <p className="text-gray-700">{message}</p>}
      {err && <p className="text-red-600">Error: {err}</p>}
    </div>
  );
}
