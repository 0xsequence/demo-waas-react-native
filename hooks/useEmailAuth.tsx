import { useState } from "react";
import { sequenceWaas } from "../waasSetup";

export function useEmailAuth({
  onSuccess,
}: {
  onSuccess: (idToken: string) => void;
}) {
  const [email, setEmail] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [instance, setInstance] = useState<string | undefined>();

  const initiateAuth = async (email: string) => {
    setLoading(true);

    try {
      const { instance } = await sequenceWaas.email.initiateAuth({ email });
      setInstance(instance);
      setEmail(email);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const sendChallengeAnswer = async (answer: string) => {
    setLoading(true);

    try {
      const sessionHash = await sequenceWaas.getSessionHash();
      const { idToken } = await sequenceWaas.email.finalizeAuth({
        instance,
        answer,
        email,
        sessionHash,
      });
      onSuccess(idToken);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return {
    inProgress: loading || !!instance,
    loading,
    error,
    initiateAuth,
    sendChallengeAnswer: instance ? sendChallengeAnswer : undefined,
  };
}
