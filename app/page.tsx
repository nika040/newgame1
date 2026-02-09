"use client";
import { useState } from "react";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useMiniApp } from "./providers/MiniAppProvider";
import styles from "./page.module.css";

const rounds = [
  {
    id: 1,
    image: "/hero.png",
    answer: "Hero Banner",
    options: ["Hero Banner", "Blue Icon", "Logo Mark", "Splash Screen"],
  },
  {
    id: 2,
    image: "/blue-icon.png",
    answer: "Blue Icon",
    options: ["Screenshot", "Blue Icon", "Sphere", "Logo Mark"],
  },
  {
    id: 3,
    image: "/sphere.svg",
    answer: "Sphere",
    options: ["Splash Screen", "Sphere", "Hero Banner", "Blue Icon"],
  },
  {
    id: 4,
    image: "/splash.png",
    answer: "Splash Screen",
    options: ["Logo Mark", "Splash Screen", "Screenshot", "Hero Banner"],
  },
  {
    id: 5,
    image: "/logo.png",
    answer: "Logo Mark",
    options: ["Logo Mark", "Blue Icon", "Screenshot", "Sphere"],
  },
];

type GuessState = "idle" | "correct" | "wrong";

export default function Home() {
  const { context } = useMiniApp();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<GuessState>("idle");
  const [score, setScore] = useState(0);

  const current = rounds[currentIndex];
  const displayName = context?.user?.displayName || "friend";
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  const handlePick = (option: string) => {
    if (status !== "idle") return;
    setSelected(option);
    if (option === current.answer) {
      setStatus("correct");
      setScore((prev) => prev + 1);
    } else {
      setStatus("wrong");
    }
  };

  const handleNext = () => {
    setSelected(null);
    setStatus("idle");
    setCurrentIndex((prev) => (prev + 1) % rounds.length);
  };

  const handleRestart = () => {
    setSelected(null);
    setStatus("idle");
    setScore(0);
    setCurrentIndex(0);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Base Mini App • Guess The Image</p>
          <h1 className={styles.title}>What Am I Looking At?</h1>
          <p className={styles.subtitle}>
            Hey {displayName}, study the image and pick the right answer before
            the next one loads in.
          </p>
        </div>
        <div className={styles.walletPanel}>
          <p className={styles.walletLabel}>Base App Account</p>
          <button
            className={styles.walletButton}
            type="button"
            onClick={() => {
              if (isConnected) {
                disconnect();
              } else if (connectors[0]) {
                connect({ connector: connectors[0] });
              }
            }}
            disabled={isPending}
          >
            {isConnected ? `Connected ${shortAddress}` : "Connect Wallet"}
          </button>
          {error && <p className={styles.walletError}>Connection failed. Try again.</p>}
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.gameCard}>
          <div className={styles.progressRow}>
            <div className={styles.progressBadge}>
              Round {currentIndex + 1}/{rounds.length}
            </div>
            <div
              className={`${styles.statusBadge} ${
                status === "correct" ? styles.statusGood : ""
              } ${status === "wrong" ? styles.statusBad : ""}`}
            >
              {status === "idle"
                ? "Make your guess"
                : status === "correct"
                ? "Correct!"
                : "Not quite"}
            </div>
          </div>

          <div className={styles.imageFrame}>
            <Image
              src={current.image}
              alt={current.answer}
              width={520}
              height={320}
              className={styles.guessImage}
              priority
            />
          </div>

          <p className={styles.prompt}>What is this image?</p>
          <div className={styles.choicesGrid}>
            {current.options.map((option) => {
              const isSelected = selected === option;
              const isCorrect = status !== "idle" && option === current.answer;
              const isWrong = status === "wrong" && isSelected;
              return (
                <button
                  key={option}
                  type="button"
                  className={`${styles.choiceButton} ${
                    isSelected ? styles.choiceSelected : ""
                  } ${isCorrect ? styles.choiceCorrect : ""} ${
                    isWrong ? styles.choiceWrong : ""
                  }`}
                  onClick={() => handlePick(option)}
                  disabled={status !== "idle"}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className={styles.controls}>
            <button className={styles.primaryButton} type="button" onClick={handleNext}>
              Next Image
            </button>
            <button className={styles.secondaryButton} type="button" onClick={handleRestart}>
              Restart
            </button>
          </div>
        </section>

        <section className={styles.sideCard}>
          <h2 className={styles.cardTitle}>Scoreboard</h2>
          <div className={styles.scoreRow}>
            <span>Score</span>
            <strong>{score}</strong>
          </div>
          <div className={styles.scoreRow}>
            <span>Best Possible</span>
            <strong>{rounds.length}</strong>
          </div>
          <div className={styles.tipBox}>
            <p className={styles.tipTitle}>Hint</p>
            <p className={styles.tipText}>
              Look for color cues and shapes. Each image comes from the Base
              mini app assets.
            </p>
          </div>
          {status !== "idle" && (
            <div className={styles.answerReveal}>
              Answer: <strong>{current.answer}</strong>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
