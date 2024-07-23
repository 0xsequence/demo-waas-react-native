import { useEffect, useState } from "react";
import { Challenge } from "@0xsequence/waas";

import { sequenceWaas } from "../waasSetup";

import { isAccountAlreadyLinkedError } from "../utils/error";

export function useEmailAuth({
  onSuccess,
  sessionName,
  linkAccount = false,
}: {
  onSuccess: (res: { wallet: string; sessionId: string }) => void;
  sessionName: string;
  linkAccount?: boolean;
}) {
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [respondWithCode, setRespondWithCode] = useState<
    ((code: string) => Promise<void>) | null
  >();

  const [challenge, setChallenge] = useState<Challenge | undefined>();

  useEffect(() => {
    return sequenceWaas.onEmailAuthCodeRequired(async (respondWithCode) => {
      setLoading(false);
      setRespondWithCode(() => respondWithCode);
    });
  }, [sequenceWaas, setLoading, setRespondWithCode]);

  const initiateAuth = async (email: string) => {
    setLoading(true);
    setInProgress(true);
    try {
      if (linkAccount) {
        const challenge = await sequenceWaas.initAuth({ email });
        setChallenge(challenge);
        setLoading(false);
      } else {
        const res = await sequenceWaas.signIn({ email }, sessionName);
        onSuccess(res);
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      if (!linkAccount) {
        setLoading(false);
        setInProgress(false);
      }
    }
  };

  const sendChallengeAnswer = async (answer: string) => {
    if (linkAccount && challenge) {
      try {
        await sequenceWaas.linkAccount(challenge.withAnswer(answer));
      } catch (e) {
        if (isAccountAlreadyLinkedError(e)) {
          console.log("Account already linked");
        }
      }
      setLoading(false);
      setInProgress(false);
      return;
    }
    if (respondWithCode) {
      await respondWithCode(answer);
    }
  };

  const cancel = () => {
    setInProgress(false);
    setLoading(false);
    setChallenge(undefined);
    setRespondWithCode(null);
  };

  return {
    inProgress,
    initiateAuth,
    loading,
    error,
    sendChallengeAnswer: inProgress ? sendChallengeAnswer : undefined,
    cancel,
  };
}
