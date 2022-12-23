import { createResource } from "solid-js";

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
    ].join(':')
  );
}

const fetchStatus = async () => (await fetch('/api/status')).json();
const fetchData = async () => (await fetch('/api/sites')).json();

function App() {
  const [status] = createResource(fetchStatus);
  const [data] = createResource(fetchData);

  return (
    <>
      <span>{data.loading && "Loading..."}</span>
      <div class="grid">
        <For each={data()}>{(item) =>
          <>
            <div>{formatDate(new Date(item.updated_at))}</div>
            <div>
              <a href={item.url}>{item.title}</a>
            </div>
            <div>{item.value}</div>
            <div>{(item.history || []).map((h) => h.value).join(', ')}</div>
          </>
        }</For>
      </div>
      <div>
        <a href="/api/fetch">fetch</a>
        <Show when={status()}>
          <span class="status">{formatDate(new Date(status().updated_at))} - {status().count}</span>
        </Show>
      </div>
    </>
  );
}

export default App;
