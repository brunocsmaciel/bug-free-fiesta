import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
    dedupingInterval: 2000, // por padrão já é 2000ms
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let dataBaseInformation = "Carregando...";
  if (!isLoading && data) {
    dataBaseInformation = (
      <>
        <div>Versão: {data.database.version}</div>
        <div>Conexões abertas: {data.database.opened_connections}</div>
        <div>Conexões máximas: {data.database.max_connections}</div>
      </>
    );
  }

  return (
    <>
      <h2>Database</h2>
      <div>{dataBaseInformation}</div>
    </>
  );
}
