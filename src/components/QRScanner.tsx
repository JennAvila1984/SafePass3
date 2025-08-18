import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function QRScanner({ onQR }: { onQR: (text: string) => void }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Scanner
        constraints={{ facingMode: "environment" }}
        onScan={(results) => {
          if (!results) return;

          const text =
            typeof results === "string"
              ? results
              : Array.isArray(results) && results.length
                ? (results[0].rawValue ||
                   results[0].decodedText ||
                   String(results[0]))
                : null;

          if (text) onQR(text);
        }}
        onError={(err) => setError(err?.message || "Error scanning QR")}
        styles={{
          container: { width: "100%", height: "100%" },
          video: { objectFit: "cover" }
        }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
