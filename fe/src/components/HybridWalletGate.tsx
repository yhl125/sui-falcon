// src/components/HybridWalletGate.tsx
import React from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useHybridWallet } from "../hooks/useHybridWalletContext";

type Props = { children: React.ReactNode };

export default function HybridWalletGate({ children }: Props) {
  const account = useCurrentAccount();
  const {
    hasHybridWallet,
    isLoading,
    error,
    createHybridWallet,
    refreshHybridWallet,
  } = useHybridWallet();

  if (!account?.address) {
    return (
      <GateCard
        title="지갑이 연결되지 않았어요"
        desc="StartPage에서 Connect를 먼저 눌러주세요."
      />
    );
  }

  if (isLoading) return <GateCard title="지갑 정보를 불러오는 중..." />;

  if (error) {
    return (
      <GateCard
        title="지갑 정보를 불러오지 못했어요"
        desc={error}
        actions={[{ label: "다시 시도", onClick: refreshHybridWallet }]}
      />
    );
  }

  if (!hasHybridWallet) {
    return (
      <GateCard
        title="하이브리드 지갑을 생성하세요"
        desc="온체인 하이브리드 지갑을 만들고 송금을 사용할 수 있어요."
        actions={[{ label: "Create Hybrid Wallet", onClick: createHybridWallet }]}
      />
    );
  }

  return <>{children}</>;
}

function GateCard({
  title,
  desc,
  actions,
}: {
  title: string;
  desc?: string;
  actions?: { label: string; onClick: () => void | Promise<void> }[];
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 12,
          padding: 24,
          maxWidth: 420,
          textAlign: "center",
          color: "white",
          fontFamily: "monospace",
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
        {desc && <p style={{ opacity: 0.85 }}>{desc}</p>}
        {actions && (
          <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(64,224,208,0.4)",
                  background: "rgba(64,224,208,0.15)",
                  color: "#E0FFFF",
                  cursor: "pointer",
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
