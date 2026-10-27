import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { STEPS, REPEAT, getActions, isValidWeight, isMaskedByFibrinogen, PLATELET_MASKED, type Patient } from "@/lib/teg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TEG Algorithm" },
      { name: "description", content: "Answer one TEG question at a time to get treatment guidance for bleeding patients." },
      { property: "og:title", content: "TEG Algorithm" },
      { property: "og:description", content: "Answer one TEG question at a time to get treatment guidance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Wizard,
});

type Screen =
  | { kind: "start" }
  | { kind: "weight" }
  | { kind: "q"; i: number }
  | { kind: "action"; i: number }
  | { kind: "end" };

const bg = { step1: "bg-step1", step2: "bg-step2", step3: "bg-step3", step4: "bg-step4" } as const;
const tx = { step1: "text-step1", step2: "text-step2", step3: "text-step3", step4: "text-step4" } as const;

function Btn({ children, onClick, tone = "primary", disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; tone?: "primary" | "yes" | "no" | "ghost" }) {
  const styles = {
    primary: "bg-primary text-primary-foreground",
    yes: "bg-destructive text-destructive-foreground",
    no: "bg-no text-on-step",
    ghost: "bg-secondary text-secondary-foreground",
  }[tone];
  return (
    <Button disabled={disabled} onClick={onClick} className={`h-auto w-full whitespace-normal rounded-2xl px-5 py-4 text-lg font-bold shadow-sm transition active:scale-[0.98] ${styles}`}>
      {children}
    </Button>
  );
}

function Wizard() {
  const [screen, setScreen] = useState<Screen>({ kind: "start" });
  const [history, setHistory] = useState<Screen[]>([]);
  const [patient, setPatient] = useState<Patient>("adult");
  const [findings, setFindings] = useState<number[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const weight = Number(weightInput);
  const validWeight = isValidWeight(weight);

  const go = (s: Screen) => { setHistory((h) => [...h, screen]); setScreen(s); window.scrollTo(0, 0); };
  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    if (screen.kind === "action") setFindings((f) => f.filter((x) => x !== screen.i));
    setHistory((h) => h.slice(0, -1));
    setScreen(prev);
  };
  const restart = () => { setHistory([]); setFindings([]); setWeightInput(""); setScreen({ kind: "start" }); };
  const next = (i: number) => go(i + 1 < STEPS.length ? { kind: "q", i: i + 1 } : { kind: "end" });

  const stepIdx = screen.kind === "q" || screen.kind === "action" ? screen.i : screen.kind === "end" ? 4 : -1;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-8">
      <header className="flex items-center justify-between py-4">
        <button onClick={back} disabled={!history.length} className="rounded-full px-3 py-2 text-sm font-bold text-muted-foreground disabled:opacity-0">← Back</button>
        <span className="font-display text-sm font-extrabold tracking-widest text-primary">TEG ALGORITHM</span>
        <button onClick={restart} disabled={screen.kind === "start"} className="rounded-full px-3 py-2 text-sm font-bold text-muted-foreground disabled:opacity-0">Restart</button>
      </header>

      {stepIdx >= 0 && (
        <div className="mb-5 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? bg[s.color] : "bg-secondary"}`} />
          ))}
        </div>
      )}

      <main key={JSON.stringify(screen)} className="animate-rise flex flex-1 flex-col">
        {screen.kind === "start" && (
          <div className="flex flex-1 flex-col justify-center gap-6">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold leading-tight">TEG Algorithm</h1>
              <p className="mt-3 text-base font-bold text-muted-foreground">Based on SCUH Massive Haemorrhage Protocol</p>
            </div>
            <div className="rounded-2xl bg-card p-4 text-sm shadow-sm">
              <p className="font-bold">Before you start</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                <li>1 × blue top (citrate) filled to correct level</li>
                <li>ieMR: order TEG 6 Global Stasis, send via Lamson</li>
                <li>View live results on TEG® Manager, then ieMR</li>
              </ul>
            </div>
            <h2 className="text-lg font-extrabold">Is this an adult or paediatric patient?</h2>
            <div className="grid gap-3">
              <Btn onClick={() => { setPatient("adult"); go({ kind: "q", i: 0 }); }}>Adult</Btn>
              <Btn tone="ghost" onClick={() => { setPatient("paed"); go({ kind: "weight" }); }}>Paediatric</Btn>
            </div>
          </div>
        )}

        {screen.kind === "weight" && (
          <div className="flex flex-1 flex-col justify-center gap-4">
            <h2 className="text-center text-lg font-extrabold">Paediatric patient weight</h2>
            <label htmlFor="patient-weight" className="font-bold">Weight (kg)</label>
            <Input id="patient-weight" type="number" inputMode="decimal" min="0" step="any" value={weightInput} onChange={(event) => setWeightInput(event.target.value)} className="h-14 text-lg" aria-invalid={weightInput !== "" && !validWeight} aria-describedby="weight-validation" />
            {weightInput !== "" && !validWeight && <p id="weight-validation" className="text-sm text-destructive">Enter a weight greater than 0 kg.</p>}
            <Btn disabled={!validWeight} onClick={() => go({ kind: "q", i: 0 })}>Continue →</Btn>
          </div>
        )}

        {screen.kind === "q" && (() => {
          const s = STEPS[screen.i];
          if (!s) return null;
          return (
            <div className="flex flex-1 flex-col gap-4">
              <div className={`rounded-2xl p-4 text-on-step ${bg[s.color]}`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-90">Step {s.n} of 4</p>
                <p className="font-display text-lg font-semibold">Check for {s.title}</p>
              </div>
              <h2 className="mt-6 text-center text-lg font-extrabold">{s.question}</h2>
              {s.hint && <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">{s.hint}</p>}
              {s.note?.map((n) => <p key={n} className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">{n}</p>)}
              <div className="mt-auto grid gap-3 pt-8">
                <Btn tone="yes" onClick={() => { setFindings((f) => [...f, screen.i]); go({ kind: "action", i: screen.i }); }}>Yes</Btn>
                <Btn tone="no" onClick={() => next(screen.i)}>No{screen.i < 3 ? ` — go to Step ${s.n + 1}` : ""}</Btn>
              </div>
            </div>
          );
        })()}

        {screen.kind === "action" && (() => {
          const s = STEPS[screen.i];
          if (!s) return null;
          const masked = isMaskedByFibrinogen(s, findings);
          return (
            <div className="flex flex-1 flex-col gap-4">
              <p className={`text-sm font-bold uppercase tracking-widest ${tx[s.color]}`}>Step {s.n} · result</p>
              <h2 className="text-center text-3xl font-extrabold">{masked ? "Platelets cannot be assessed yet" : s.finding}</h2>
              <div className="rounded-2xl border-2 border-destructive bg-card p-4">
                <p className="text-sm font-extrabold uppercase tracking-wider text-destructive">Action · {patient === "adult" ? "Adult" : `Paediatric · ${weight} kg`}</p>
                {masked ? (
                  <p className="mt-2 text-lg font-bold">{PLATELET_MASKED}</p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-lg font-bold">
                    {getActions(s, patient, weight).map((a) => <li key={a}>{a}</li>)}
                  </ul>
                )}
              </div>
              {!masked && s.actionNote?.map((n) => <p key={n} className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">{n}</p>)}
              {!masked && patient === "paed" && (s.n === 2 || s.n === 3) && <p className="text-sm text-muted-foreground">Weight-based total shown; confirm bag volume with Blood Bank and do not exceed {s.n === 2 ? "1 bag" : "2 bags"}.</p>}
              {!masked && <p className="text-muted-foreground">{REPEAT}</p>}
              <div className="mt-auto grid gap-3 pt-6">
                <Btn onClick={() => next(screen.i)}>{screen.i < 3 ? `Continue to Step ${s.n + 1} →` : "See summary →"}</Btn>
              </div>
            </div>
          );
        })()}

        {screen.kind === "end" && (
          <div className="flex flex-1 flex-col gap-4">
            {findings.length === 0 ? (
              <>
                <h2 className="mt-6 text-center text-4xl font-extrabold">Normal TEG</h2>
                <p className="text-lg text-muted-foreground">No immediate intervention required.</p>
              </>
            ) : (
              <>
                <h2 className="text-center text-3xl font-extrabold">Summary</h2>
                {patient === "paed" && <p className="font-bold">Paediatric · {weight} kg</p>}
                {findings.map((i) => {
                  const s = STEPS[i];
                  if (!s) return null;
                  const masked = isMaskedByFibrinogen(s, findings);
                  return (
                    <div key={i} className="rounded-2xl bg-card p-4 shadow-sm">
                      <p className={`text-xs font-bold uppercase tracking-widest ${tx[s.color]}`}>Step {s.n}</p>
                      <p className="text-lg font-extrabold">{masked ? "Platelets cannot be assessed yet" : s.finding}</p>
                      {masked ? (
                        <p className="mt-1 text-muted-foreground">{PLATELET_MASKED}</p>
                      ) : (
                        <>
                          <ul className="mt-1 text-muted-foreground">{getActions(s, patient, weight).map((a) => <li key={a}>{a}</li>)}</ul>
                          {patient === "paed" && (s.n === 2 || s.n === 3) && <p className="mt-2 text-sm text-muted-foreground">Confirm bag volume with Blood Bank; do not exceed {s.n === 2 ? "1 bag" : "2 bags"}.</p>}
                        </>
                      )}
                    </div>
                  );
                })}
                <p className="text-muted-foreground">{REPEAT}</p>
              </>
            )}
            <div className="mt-auto pt-6"><Btn onClick={restart}>Start again</Btn></div>
          </div>
        )}
      </main>

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        Based on SCHHS doc 001050.11. Decision support only — always apply clinical judgement.
        <br />Help: sc-transfusionnurse@health.qld.gov.au
      </footer>
    </div>
  );
}
