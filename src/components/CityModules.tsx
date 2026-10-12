import { useRemote } from "../commerce/useRemote";
type Module = { title: string; status: string; items: {name: string; note: string}[] };
export function CityModules({section}: {section: string}) {
  const {data, error, loading, retry} = useRemote<Record<string,Module>>("/city-modules");
  if (loading) return <div className="empty" role="status">Загружаем раздел…</div>;
  if (error) return <div className="empty" role="alert"><p>{error}</p><button onClick={retry}>Повторить</button></div>;
  const module = data?.[section];
  return <section className="widget"><h2>{module?.title}</h2><p>{module?.status}</p>
    {module?.items.map(item => <div className="city-module-item" key={item.name}><h3>{item.name}</h3><p>{item.note}</p></div>)}
    {!module?.items.length && <p className="empty">Подтверждённых данных пока нет.</p>}
  </section>;
}
