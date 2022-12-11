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
      padTo2Digits(date.getSeconds()),
    ].join(':')
  );
}

const fetchData = async () => (await fetch('/api/sites')).json();

function App() {
  const [data] = createResource(fetchData);

  // const sites = data.map((item) => {
  //   return {
  //     url: item.url,
  //     value: item.value,
  //     updated_at: new Date(item.updated_at)
  //   }
  // }).sort((a, b) => {
  //   return b.updated_at - a.updated_at
  // })

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
    </>
  );
}

export default App;
