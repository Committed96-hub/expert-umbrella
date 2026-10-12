import { useEffect, useState } from "react";
import { httpApi } from "../api";
export function useRemote<T>(path: string) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    httpApi
      .request<T>(path)
      .then((x) => {
        if (active) setData(x);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Ошибка API");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, reload]);
  return {
    data,
    error,
    loading,
    retry: () => setReload((x) => x + 1),
    setData,
  };
}
export function RemoteState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  return (
    <div className="empty" role={error ? "alert" : "status"}>
      <h3>{loading ? "Загружаем данные…" : "Не удалось загрузить"}</h3>
      {error && (
        <>
          <p>{error}</p>
          <button className="primary" onClick={retry}>
            Повторить
          </button>
        </>
      )}
    </div>
  );
}
